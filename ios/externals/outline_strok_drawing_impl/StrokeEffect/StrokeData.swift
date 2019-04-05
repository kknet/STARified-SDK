//
//  StrokeData.swift
//  StrokeEffect
//
//  Created by Koretskiyil on 14/09/2017.
//  Copyright © 2017 ikoretskiy. All rights reserved.
//

import Foundation


import Metal

struct Color {
    var r ,g ,b, a : Float
    init (_ r : Float, _ g : Float, _ b : Float, _ a : Float ){
        self.r = r
        self.g = g
        self.b = b
        self.a = a
    }
}

extension Color {
    //TODO how to accept only numerics values instead of specialized Int
    static func makeNormalized(_ r : Int, _ g : Int, _ b : Int, _ a : Int ) -> Color {
        return Color(Float(r) / 255.0, Float(g) / 255.0, Float(b) / 255.0, Float(a) / 255.0)
    }
}

struct Vertex {
    var x,y : Float
    var r, g, b, a : Float
    
    func floatBuffer() -> [Float] {
        return [x, y, r, g, b, a]
    }
    
    func appendTo(_ array : inout [Float]){
        // N.B. Adding one by one works faster than allocation a lot of lists. How to make it better?
        array.append(x)
        array.append(y)
        array.append(r)
        array.append(g)
        array.append(b)
        array.append(a)
    }
}

class VertexGenerator {
    var width : Float
    var height : Float
    
    public init(width : Int , height : Int){
        self.width = Float(width)
        self.height = Float(height)
    }
    
    public func makeVertex(x : Float, y : Float, color : Color) -> Vertex{
        let normX = normalize(val: x, norm: width);
        let normY = normalize(val: y, norm: height, flip: true)
        let result = Vertex(x: normX, y: normY, r: color.r, g: color.g, b: color.b, a : color.a)
        return result
        
    }
    
    func normalize(val : Float, norm : Float, flip : Bool = false) -> Float{
        var res : Float = 0.0;
        
        if flip {
            res  = 2.0 * (1.0 - val / norm) - 1.0
        }
        else {
            res  = 2.0 * val / norm - 1.0
        }
        
        return res;
    }
}

struct BBox{
    var x0, y0 : Int
    var width, height: Int
}

struct StrokeDataParams{
    // Distance in px between between keypoints
    var pointSamplinDistance : Float = 16.0
    
    // New points number after sampling
    var interpolationPointsCount : Int = 5

    
    var rectWidthMin : Float
    var rectWidthMax : Float
    var widthChangeFactor : Float
    var scaleFactor : Int
    var color : Color
    var offset : Float
    var shiftRange : Float
    
    var counter : UInt32
 
    init (color : Color, offset : Float, shiftRange : Float, scaleFactor : Int, widthChangeFactor : Float, minStrokeWidth : Float, maxStrokeWidth : Float, counter : UInt32 ){
        self.color = color
        self.offset = offset
        self.shiftRange = shiftRange
        self.scaleFactor = scaleFactor
        self.widthChangeFactor = widthChangeFactor
        self.rectWidthMin = minStrokeWidth
        self.rectWidthMax = maxStrokeWidth
        self.counter = counter
    }
}

class StrokeData{
    var _vertexBuffer : MTLBuffer?
    var vertexData :  [Float];
    var vertexBuffer : MTLBuffer?
    {
        get{
            return _vertexBuffer
        }
    }
    
    // TODO replace to an array of borders
    var _vertexRightBorderBuffer : MTLBuffer?
    var vertexRightBorderData :  [Float];
    var vertexRightBorderBuffer : MTLBuffer?
    {
        get{
            return _vertexRightBorderBuffer
        }
    }

    var _vertexLeftBorderBuffer : MTLBuffer?
    var vertexLeftBorderData :  [Float];
    var vertexLeftBorderBuffer : MTLBuffer?
    {
        get{
            return _vertexLeftBorderBuffer
        }
    }

    let AABorderWidth : Float = 1.0; // px
    
    // Number should be synchonized with generateRectCoordFromLine
    let vertexPerLine = 4;
    
    lazy var linesCount : Int = 0;
    var vertexCount : Int{
        get{
            return vertexPerLine * linesCount
        }
    }
    
    var vertexBorderCount : Int{
        get{
            let bordersCount = 2 // left and right border
            return vertexPerLine * linesCount * bordersCount
        }
    }

    init(
        device : MTLDevice,
        verticies : [ChainPointFloat],
        width : Int, height : Int,
        params : StrokeDataParams,
        effects : [Effect]
        ){
        vertexData = [Float]()
        
        
        //let time = Int(NSDate().timeIntervalSinceReferenceDate)
        srand48(100)
        
        vertexLeftBorderData = [Float]()
        vertexRightBorderData = [Float]()

        // TODO move preprocessPoints to the separate class
        var (outerContour, innerContour) = preprocessPoints(verticies: verticies, params : params, effects : effects)
        
        
        let vertexGenerator = VertexGenerator(width: width, height: height)
        linesCount = 0;

        vertexData.reserveCapacity(4 * 6 * (outerContour.count - 2))
        vertexLeftBorderData.reserveCapacity(4 * 6 * (outerContour.count - 2))
        vertexRightBorderData.reserveCapacity(4 * 6 * (outerContour.count - 2))

        
        for in_idx in 0...outerContour.count - 2{
            
            let pointPrev : ChainPointFloat = outerContour[in_idx ];
            let pointNext : ChainPointFloat = outerContour[in_idx + 1]
            
            let pointPrevRef : ChainPointFloat = innerContour[in_idx ];
            let pointNextRef : ChainPointFloat = innerContour[in_idx + 1]
            
            updateVertexDataWithRectCoordFromLine(
                pointPrev: pointPrev, pointNext: pointNext,
                pointPrevRef: pointPrevRef, pointNextRef: pointNextRef,
                vertexGenerator: vertexGenerator,
                color: params.color
            )
            linesCount += 1
        }

        let dataSize = vertexData.count * MemoryLayout.size(ofValue: vertexData[0])
        _vertexBuffer = device.makeBuffer(bytes: vertexData, length: dataSize, options: [])
        
        let dataBorderSize = vertexLeftBorderData.count * MemoryLayout.size(ofValue: vertexData[0])
        _vertexRightBorderBuffer = device.makeBuffer(bytes: vertexRightBorderData, length: dataBorderSize, options: [])
        _vertexLeftBorderBuffer = device.makeBuffer(bytes: vertexLeftBorderData, length: dataBorderSize, options: [])
    }
    
    
    private func preprocessPoints(
        verticies : [ChainPointFloat],
        params : StrokeDataParams,
        effects : [Effect]
        ) -> ([ChainPointFloat], [ChainPointFloat]) {
        //rescale
        let scaledVerticies : [ChainPointFloat] = applyPointsResize(verticies: verticies, scaleFactor : params.scaleFactor)
        
        //remove noise
        let denoisedVerticies  : [ChainPointFloat] = makeNewChainByDistance(verticies: scaledVerticies, requredMinDist: params.pointSamplinDistance, interpPointsCount: params.interpolationPointsCount);        
        
        //apply per vertex normal offset
        //  to the outer contour with random offset
        //  to the inner contour with fixed offset
        var (outerContour, innerContour) = applyPerPointsEffects(verticies: denoisedVerticies, effects: effects)
        
        
        // removing loops after an offset
        var (outerContourClean, innerContourClean) = makeNewChainByDistance(
            verticies: outerContour,
            verticiesReference: innerContour,
            requredMinDist: 1,
            skip: true,
            interpPointsCount: 1)
        print("verticies count after deloop", outerContourClean.count, innerContourClean.count)
        
        outerContour = applyPointInterpolation(verticies: outerContourClean, interpPointsCount: params.interpolationPointsCount)
        innerContour = applyPointInterpolation(verticies: innerContourClean, interpPointsCount: params.interpolationPointsCount)
        
        return (outerContourClean, innerContourClean)
    }

    private func processPointEffects(
        outerContour : inout [ChainPointFloat],
        innerContour : inout [ChainPointFloat],
        point : ChainPointFloat,
        angle : Float,
        effects : [Effect]){
        let cosAngle: Float = cos(angle)
        let sinAngle: Float = sin(angle)
        var outerPoint = ChainPointFloat(other: point)
        var innerPoint = ChainPointFloat(other: point)
        
        for effect in effects {
            effect.apply(outerPoint: &outerPoint, innerPoint: &innerPoint, cosAngle: cosAngle, sinAngle: sinAngle)
        }
        
        outerContour.append(outerPoint)
        innerContour.append(innerPoint)

    }

    private func applyPerPointsEffects(
        verticies: [ChainPointFloat],
        effects : [Effect]
        ) -> ([ChainPointFloat], [ChainPointFloat]){
        var outerContour = [ChainPointFloat]()
        var innerContour = [ChainPointFloat]()
        

        //var widths = Set<Float>()
        
        for idx in  1..<verticies.count - 1{
            let p1 : ChainPointFloat = verticies[idx - 1]
            let p2 : ChainPointFloat = verticies[idx ]
            let p3 : ChainPointFloat = verticies[idx + 1]

            let prevAngle = getAngle(pointNext: p2, pointPrev: p1)
            let nextAngle = getAngle(pointNext: p3, pointPrev: p2)
            var avgAngle = (prevAngle + nextAngle) / 2
            if ((nextAngle - prevAngle) > Float.pi) {
                avgAngle = prevAngle;
            }
            
            if idx == 1{
                processPointEffects(outerContour : &outerContour, innerContour : &innerContour,  point : p1, angle : prevAngle, effects: effects)
            }
            else if idx == verticies.count - 2{
                processPointEffects(outerContour : &outerContour, innerContour : &innerContour,  point : p3, angle : nextAngle, effects: effects)
            }
            
            processPointEffects(outerContour : &outerContour, innerContour : &innerContour,  point : p2, angle : avgAngle, effects: effects)
        }
        return (outerContour, innerContour)
    }
    
    private func applyPointsResize(verticies : [ChainPointFloat], scaleFactor : Int) -> [ChainPointFloat] {
        var result = [ChainPointFloat]()
        
        for vertex in verticies{
            var newVertex = vertex.copy()
            newVertex *= scaleFactor
            result.append(newVertex)
        }
        
        return result
    }
    
    private func getCenterPoint(verticies : [ChainPointFloat]) -> ChainPointFloat {
        var result = ChainPointFloat(x: 0.0, y: 0.0, depth: 0)
        
        for vertex in verticies{
            result += vertex
        }
        result /= verticies.count
        return result
    }
    
    private func applyPointInterpolation(verticies: [ChainPointFloat], interpPointsCount: Int) -> [ChainPointFloat]{
        var result : [ChainPointFloat] = [ChainPointFloat]()
        
        result.append(verticies[0])
        
        for idx in 1..<verticies.count - 2{
            let P0 : ChainPointFloat = verticies[idx - 1];
            let P1 : ChainPointFloat = verticies[idx];
            let P2 : ChainPointFloat = verticies[idx + 1];
            let P3 : ChainPointFloat = verticies[idx + 2];
            
            let alpha : Float = 0.5
            func tj(ti : Float, Pi : ChainPointFloat, Pj : ChainPointFloat) -> Float {
                return (pow(
                    sqrt(pow((Pj.x-Pi.x), 2) + pow((Pj.y-Pi.y), 2)), alpha)
                        + ti)
            }
            
            let t0 : Float = 0.0
            let t1 : Float = tj(ti: t0, Pi : P0, Pj : P1)
            let t2 : Float = tj(ti: t1, Pi : P1, Pj : P2)
            let t3 : Float = tj(ti: t2, Pi : P2, Pj : P3)
            
            //Implementation was taken from https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
            result.append(P1)
            for interpIdx in 1..<interpPointsCount{
                let t : Float = t1 + Float(interpIdx) * (t2 - t1) / Float(interpPointsCount)
                
                let A1 = (t1-t)/(t1-t0)*P0 + (t-t0)/(t1-t0) * P1
                let A2 = (t2-t)/(t2-t1)*P1 + (t-t1)/(t2-t1)*P2
                let A3 = (t3-t)/(t3-t2)*P2 + (t-t2)/(t3-t2)*P3
                let B1 = (t2-t)/(t2-t0)*A1 + (t-t0)/(t2-t0)*A2
                let B2 = (t3-t)/(t3-t1)*A2 + (t-t1)/(t3-t1)*A3
                let C  = (t2-t)/(t2-t1)*B1 + (t-t1)/(t2-t1)*B2
                result.append(C)
            }
            
            result.append(P2)
        }
        
        result.append(verticies[verticies.count-1])
        return result
    }
    
    private func makeNewChainByDistance(
        verticies : [ChainPointFloat],
        requredMinDist : Float,
        skip : Bool = false,
        interpPointsCount : Int = 1
        ) -> [ChainPointFloat]{
        var result : [ChainPointFloat] = [ChainPointFloat]()
        
        var lastPoint = verticies[0]

        result.append(verticies[0])
        
        // if skip
        let maxSkipDistance = 10 ;// Change to configurable parameter
        var curIdx = 1
        while true{
            if curIdx > verticies.count - 1{
                break
            }
            
            var nextPointIsReady : Bool = false

            let curVertex = verticies[curIdx]
            let dist : Float = lastPoint.distTo(other: curVertex)
            if dist >= requredMinDist  || curIdx == verticies.count - 1{
                nextPointIsReady = true
            }
            else {
                curIdx += 1
            }

            if nextPointIsReady{
                let curVertex = verticies[curIdx]
                let newPointsCount = interpPointsCount
                for newPointIdx in 1...newPointsCount{
                    let newX  : Float  = Float(lastPoint.x) + Float(newPointIdx) * (Float(curVertex.x) - Float(lastPoint.x)) / Float(newPointsCount + 1)
                    let newY : Float = Float(lastPoint.y) + Float(newPointIdx) * (Float(curVertex.y) - Float(lastPoint.y)) / Float(newPointsCount + 1)
                    let generatedPoint = ChainPointFloat(x: newX, y: newY, depth: 0)
                    result.append(generatedPoint)
                }
                
                lastPoint = verticies[curIdx]
                result.append(lastPoint)
                curIdx += 1
            }

        }
        return result
    }
    
    private func makeNewChainByDistance(
        verticies : [ChainPointFloat],
        verticiesReference : [ChainPointFloat],
        requredMinDist : Float,
        skip : Bool = false,
        interpPointsCount : Int = 1
        ) -> ([ChainPointFloat], [ChainPointFloat]) {
        
        var lastPoint = verticies[0]
        var lastPointRef = verticiesReference[0]
        
        var result : [ChainPointFloat] = [ChainPointFloat]()
        var resultReference : [ChainPointFloat] = [ChainPointFloat]()
        
        result.append(verticies[0])
        resultReference.append(verticiesReference[0])
        
        let maxSkipDistance : Int = 30
        // Skip distance - number of points we are checking to find a loop
        let skipDistance = min(maxSkipDistance, verticies.count / 2)
        
        var curIdx = 1
        while true{
            if curIdx > verticies.count - 1{
                break
            }
            
            var nextPointIsReady : Bool = false
            
            
            if skip{
                var minPossibleDist : Float = 10000.0
                var nextIdx = curIdx
                let toIdx : Int = min(curIdx + skipDistance, verticies.count - 1)
                
                // search in range for another  suitable candidates.
                for skipIdx in curIdx...toIdx{
                    let curVertex = verticies[skipIdx]
                    let dist : Float = lastPoint.distTo(other: curVertex)
                    if (dist < minPossibleDist && dist >= requredMinDist || curIdx == verticies.count - 1) {
                        nextIdx = skipIdx
                        minPossibleDist = dist
                    }
                }
                curIdx = nextIdx
                nextPointIsReady = true
            }
            else{
                let curVertex = verticies[curIdx]
                let dist : Float = lastPoint.distTo(other: curVertex)
                if dist >= requredMinDist  || curIdx == verticies.count - 1{
                    nextPointIsReady = true
                }
                else {
                    curIdx += 1
                }
            }
            
            if nextPointIsReady{
                let curVertex = verticies[curIdx]
                let curVertexRef = verticiesReference[curIdx]
                let newPointsCount = interpPointsCount
                for newPointIdx in 1..<newPointsCount{
                    let newX  : Float  = Float(lastPoint.x) + Float(newPointIdx) * (Float(curVertex.x) - Float(lastPoint.x)) / Float(newPointsCount)
                    let newY : Float = Float(lastPoint.y) + Float(newPointIdx) * (Float(curVertex.y) - Float(lastPoint.y)) / Float(newPointsCount)
                    var generatedPoint = ChainPointFloat(x: newX, y: newY, depth: 0)
                    result.append(generatedPoint)
                    
                    let newXRef : Float  = Float(lastPointRef.x) + Float(newPointIdx) * (Float(curVertexRef.x) - Float(lastPointRef.x)) / Float(newPointsCount)
                    let newYRef : Float = Float(lastPointRef.y) + Float(newPointIdx) * (Float(curVertexRef.y) - Float(lastPointRef.y)) / Float(newPointsCount)
                    generatedPoint = ChainPointFloat(x: newXRef, y: newYRef, depth: 0)
                    resultReference.append(generatedPoint)
                }
                
                lastPoint = verticies[curIdx]
                lastPointRef = verticiesReference[curIdx]
                result.append(lastPoint)
                resultReference.append(verticiesReference[curIdx])
                curIdx += 1
            }
            
        }
        return (result, resultReference)
    }


    private func getNewWidthShift(range : Float) -> Float {
        let possibleRealRange : Float = range
        let maxRandomRange = 1000
        var generatedShift = Float(arc4random_uniform(UInt32(maxRandomRange)))
        // [-maxRandomRange / 2; maxRandomRange /2]
        
        generatedShift = possibleRealRange * generatedShift / Float(maxRandomRange) // [-possibleRealRange; possibleRealRange] with descitization based on generatedShift
        
        let nextWidthShift = generatedShift
        
        return nextWidthShift
    }
    
    private func getAngle(pointNext : ChainPointFloat, pointPrev : ChainPointFloat) -> Float{
        var angle = atan2f(Float(pointNext.y - pointPrev.y), Float(pointNext.x - pointPrev.x))
        angle += Float.pi / 2
        return angle
    }
    
    private func updateVertexDataWithRectCoordFromLine(
        pointPrev: ChainPointFloat,
        pointNext: ChainPointFloat,
        pointPrevRef: ChainPointFloat,
        pointNextRef: ChainPointFloat,
        vertexGenerator: VertexGenerator,
        color: Color
        ){
        let angle = getAngle(pointNext: pointNext, pointPrev: pointPrev)
        //_ = getAngle(pointNext: pointNextRef, pointPrev: pointPrevRef)
        
        let rectangleColor = Color(color.r, color.g, color.b, 1.0);
        //let debugRectangleColor = Color(1.0, 0.0, 0.0, 1.0);
        let debugRectangleColor = rectangleColor;
        
        let borderColor = Color(color.r, color.g, color.b, 0.0);
        
        // Geneate rectangle body
        
        var prev_left = vertexGenerator.makeVertex(x: Float(pointPrev.x), y: Float(pointPrev.y) ,
                                                   color : debugRectangleColor)
        
        var prev_right = vertexGenerator.makeVertex(x: Float(pointPrevRef.x), y: Float(pointPrevRef.y) ,
                                                    color : debugRectangleColor)
        
        var next_left = vertexGenerator.makeVertex(x: Float(pointNext.x ), y: Float(pointNext.y) ,
                                                   color : rectangleColor)
        
        var next_right = vertexGenerator.makeVertex(x: Float(pointNextRef.x), y: Float(pointNextRef.y) ,
                                                    color : rectangleColor)
        
        
        prev_left.appendTo(&vertexData)
        prev_right.appendTo(&vertexData)
        next_left.appendTo(&vertexData)
        next_right.appendTo(&vertexData)
     
        
        
        // Generate borders
        
        // right border
        prev_left = vertexGenerator.makeVertex(x: Float(pointPrevRef.x)  - cos(angle) * self.AABorderWidth ,
                                               y: Float(pointPrevRef.y)  - sin(angle) * self.AABorderWidth,
                                               color : borderColor)
        
        prev_right = vertexGenerator.makeVertex(x: Float(pointPrevRef.x),
                                                y: Float(pointPrevRef.y),
                                                color : rectangleColor)
        
        next_left = vertexGenerator.makeVertex(x: Float(pointNextRef.x ) - cos(angle) * self.AABorderWidth ,
                                               y: Float(pointNextRef.y ) - sin(angle) * self.AABorderWidth,
                                               color : borderColor)
        
        next_right = vertexGenerator.makeVertex(x: Float(pointNextRef.x) ,
                                                y: Float(pointNextRef.y) ,
                                                color : rectangleColor)
        
   
        prev_left.appendTo(&vertexRightBorderData)
        prev_right.appendTo(&vertexRightBorderData)
        next_left.appendTo(&vertexRightBorderData)
        next_right.appendTo(&vertexRightBorderData)
  
        // Left border
        prev_left = vertexGenerator.makeVertex(x: Float(pointPrev.x ) + cos(angle) * self.AABorderWidth,
                                               y: Float(pointPrev.y ) + sin(angle) * self.AABorderWidth,
                                               color : borderColor)
        
        prev_right = vertexGenerator.makeVertex(x: Float(pointPrev.x),
                                                y: Float(pointPrev.y),
                                                color : rectangleColor)
        
        next_left = vertexGenerator.makeVertex(x: Float(pointNext.x ) + cos(angle) * self.AABorderWidth,
                                               y: Float(pointNext.y ) + sin(angle) * self.AABorderWidth,
                                               color : borderColor)
        
        next_right = vertexGenerator.makeVertex(x: Float(pointNext.x),
                                                y: Float(pointNext.y),
                                                color : rectangleColor)
        
        prev_left.appendTo(&vertexLeftBorderData)
        prev_right.appendTo(&vertexLeftBorderData)
        next_left.appendTo(&vertexLeftBorderData)
        next_right.appendTo(&vertexLeftBorderData)

    }
}
