//
//  ContourExtractor.swift
//  StrokeEffect
//
//  Created by Koretskiyil on 01/10/2017.
//  Copyright © 2017 ikoretskiy. All rights reserved.
//

import Foundation

final private class TraceHistory{
    public static let NOT_VISITED : Int = -2;
    public static let VISITED : Int = -1;
    fileprivate var  traceHistory : [Int];
    
    var width : Int = 0;
    var height : Int = 0;
    
    
    init(width : Int, height : Int){
        self.width = width
        self.height = height
        traceHistory = [Int](repeating: TraceHistory.NOT_VISITED, count: width * height)
    }
    
    //TODO how can i make this function as a setter with more than one argument?
    func setDepth (_ x : Int, _ y : Int, _ depth : Int){
        traceHistory[y * width + x] = depth;
    }
    
    func getDepth (_ x : Int, _ y : Int) -> Int{
        return traceHistory[y * width + x];
    }
    
    func isVisited(x : Int, y : Int) -> Bool{
        return traceHistory[y * width + x] != TraceHistory.NOT_VISITED
    }
}

// TODO replace to a generic contour value
final private class Contour{
    private var points = [ChainPointInt]();
    
    func addPoint(_ point : ChainPointInt){
        points.append(point)
    }
    
    func remove(at: Int) -> ChainPointInt{
        return points.remove(at: at)
    }
    
    var count : Int {
        get {
            return points.count
        }
    }
    
    subscript(index : Int ) -> ChainPointInt {
        return points[index]
    }
    
    func clear(){
        points.removeAll()
    }
}



final class ContourFloat{
    fileprivate var _points :  [ChainPointFloat];
    
    var points : [ChainPointFloat] {
        get {
            return _points
        }
    }
    
    func addPoint(_ point : ChainPointInt){
        _points.append(ChainPointFloat(other : point))
    }
    
    
    func addPoint(_ point : ChainPointFloat){
        _points.append(point)
    }
    
    func lastPoint() -> ChainPointFloat {
        return _points[_points.endIndex - 1]
    }
    
    subscript(index : Int) -> ChainPointFloat {
        return _points[index]
    }
    
    var count : Int{
        get {
            return _points.count
        }
    }
    
    func reverse() {
        _points.reverse();
    }
    
    init(reserve : Int = 0) {
        _points = [ChainPointFloat]()
        _points.reserveCapacity(reserve)
    }
}

final class ContourExtraction {
    private var traceHistory : TraceHistory;
    private var toVisit : [ChainPointInt] =  [ChainPointInt]() ;
    private var width : Int
    private var height : Int
    
    init (width : Int, height : Int){
        self.width = width
        self.height = height
        traceHistory = TraceHistory(width : width, height : height)
    }
    
    public func findContours(data: [UInt8], contours : inout [ContourFloat]){
        // Depth first search for a contour. Starting from the left bottom point and searching for the first non BG point
        
        var contour : Contour = Contour()
        
        for y in 1...height-2{
            for x in 1...width-2{
                
                // if cell was visited
                if traceHistory.isVisited(x: x, y: y){
                    continue
                }
                
                // if cell is bg
                let val = data[y * width + x]
                if val == 0 {
                    traceHistory.setDepth(x, y, TraceHistory.VISITED)
                    continue
                }
                
                
                
                traceContour(
                    contour : contour,
                    startPoint : ChainPointInt(x: x, y: y, depth: 0),
                    bytes : data)
            
                let minPointsCount = 40
                
                //print(contour.count)
                if contour.count > minPointsCount{
                    let orderedContour : ContourFloat = sortAndConvertContour(contour : contour )
                    contours.append(orderedContour)
                    
                    // Don't want to create a new contour on every non BG pixel so recreate it only when needed
                    contour = Contour()
                }
                else{
                    contour.clear()
                }
                
            }
        }
    }
    
    
    private func traceContour(
        contour : Contour,
        startPoint : ChainPointInt, bytes : [UInt8]){
        
        toVisit.append(startPoint)
    
        while toVisit.count > 0 {
            let point: ChainPointInt = toVisit.removeLast()
            
            //if point already visited or it's not a bg
            if (traceHistory.isVisited(x: point.x, y: point.y) || bytes[point.y * width + point.x] == 0){
                continue
            }
            
            traceHistory.setDepth(point.x, point.y, point.depth)
            
            let isBorderPoint = (point.y == 0 || point.y  == height - 1 || point.x == 0 || point.x == width - 1)
            
            var isEdge = false
            
            if isBorderPoint {
                isEdge = true
                var edgeSum : Int = 0;
                
                if point.y > 0 {
                    edgeSum +=
                        bytes[(point.y - 1) * width + point.x ] > UInt8(0) ? 1 : 0;
                }
                
                if point.x > 0 {
                    edgeSum +=
                        bytes[point.y * width + point.x - 1] > UInt8(0) ? 1 : 0;
                }
                
                if point.y < height - 2{
                    edgeSum +=
                        bytes[(point.y + 1) * width  + point.x] > UInt8(0) ? 1 : 0;
                }
                
                if point.x < width {
                    edgeSum +=
                        bytes[point.y * width + point.x + 1] > UInt8(0) ? 1 : 0;
                }
                isEdge = edgeSum == 2
            }
            else{
                // edge point should have some non FG neighbours
                var edgeSum : Int =
                    bytes[(point.y - 1) * width + point.x ] > UInt8(0) ? 1 : 0;
                edgeSum +=
                    bytes[point.y * width + point.x - 1] > UInt8(0) ? 1 : 0;
                edgeSum +=
                    bytes[(point.y + 1) * width  + point.x] > UInt8(0) ? 1 : 0;
                edgeSum +=
                    bytes[point.y * width + point.x + 1] > UInt8(0) ? 1 : 0;
                
                isEdge = edgeSum >= 1 && edgeSum < 4
            }
            
            
            
            //if it isn't inner point
            if isEdge {
                //add point to the trace
                //mark as visited
                contour.addPoint(point)
                
                // Check 8-connected components
                for y_shift in stride(from: -1, to: 2, by: 1){
                    for x_shift in stride(from: -1, to: 2, by: 1){
                        if !(x_shift == 0 && y_shift == 0) {
                            let shifted_x = Int(point.x) + x_shift;
                            let shifted_y = Int(point.y) + y_shift;
                            let nextDepth = point.depth + 1;
                            
                            if shifted_x > 0 && shifted_x < width - 1 &&
                                shifted_y > 0 && shifted_y < height - 1 {
                                
                                if !traceHistory.isVisited(x: shifted_x, y: shifted_y) {
                                    toVisit.append(ChainPointInt(x: shifted_x, y : shifted_y, depth : nextDepth));
                                }
                            }
                        } // !(x_shift == 0 && y_shift == 0) {
                    } // for x_shift in stride(from: -1, to: 2, by: 1){
                } // for y_shift in stride(from: -1, to: 2, by: 1){
            } // if isEdge
        }
    }
    
    private func sortAndConvertContour(contour : Contour) -> ContourFloat {
        let resultContour = ContourFloat(reserve: contour.count)
        var wasTakenFlags = [UInt8](repeating : 0, count : contour.count)
        
        resultContour.addPoint(contour[0])
        wasTakenFlags[0] = 1
        
        let distThreshold : Float = 10.0;
        
        while resultContour.count < contour.count {
            var minDist : Float = 10000000.0 // random big number
            let point : ChainPointFloat = resultContour.lastPoint()
            var minIdx = 0
            for i in 0 ..< contour.count {
                if wasTakenFlags[i] != 0 {
                    continue
                }
                
                let destPoint : ChainPointInt = contour[i]
                let dist = point.distTo(other: destPoint)
                if dist < minDist {
                    minDist = dist
                    minIdx = i
                }
            }
            
            // If we still have points and the next one is too far.
            if (minDist > distThreshold){
                resultContour.reverse()
                continue;
            }
            
            //print ("minIdx " , minIdx)
            resultContour.addPoint(contour[minIdx])
            wasTakenFlags[minIdx] = 1
        }
        
        let maxDistance : Float = 10.0;
        if (resultContour.points.last!.distTo(other: resultContour.points.first!) < maxDistance) {
            resultContour.addPoint(ChainPointFloat(x: resultContour[0].x, y: resultContour[0].y))
        }
        return resultContour
    }

}

