//
//  ChainPoint.swift
//  StrokeEffect
//
//  Created by Koretskiyil on 05/10/2017.
//  Copyright © 2017 ikoretskiy. All rights reserved.
//

import Foundation

// TODO more than sure that Swift should support typedef or something like this
// or a way to make there two classes templated
struct ChainPointInt {
    var x : Int ;
    var y : Int ;
    var depth : Int = 0;
}

public struct ChainPointFloat {
    var x : Float ;
    var y : Float ;
    
    var depth : Int = 0;
    
    
    func copy() -> ChainPointFloat {
        return ChainPointFloat(x : self.x, y : self.y , depth : self.depth)
    }
    
    func distTo (other : ChainPointFloat) -> Float{
        let dist : Float = sqrt((self.x - other.x) * (self.x - other.x) +
            (self.y - other.y) * (self.y - other.y))
        return dist
    }
    
    func distTo (other : ChainPointInt) -> Float{
        let dist : Float = sqrt((self.x - Float(other.x)) * (self.x - Float(other.x)) +
            (self.y - Float(other.y)) * (self.y - Float(other.y)))
        return dist
    }
    
    
    init (x : Float, y : Float, depth : Int = 0){
        self.x = x;
        self.y = y
        self.depth = depth
    }
    
    init (other : ChainPointInt){
        self.x = Float(other.x)
        self.y = Float(other.y)
        self.depth = other.depth
    }
    
    init (other : ChainPointFloat){
        self.x = other.x
        self.y = other.y
        self.depth = other.depth
    }
}

extension ChainPointFloat {
    static func += (left: inout ChainPointFloat, right: ChainPointFloat) {
        left.x  += right.x
        left.y  += right.y
    }
    
    static func + (left: ChainPointFloat, right: ChainPointFloat) -> ChainPointFloat{
        let result = ChainPointFloat (x: left.x + right.x, y: left.y + right.y)
        return result
    }
    
    static func *= (left: inout ChainPointFloat, right: Int) {
        left.x  *= Float(right)
        left.y  *= Float(right)
    }
    
    static func * (left: ChainPointFloat, right: Float) -> ChainPointFloat{
        let result = ChainPointFloat(x: left.x * right, y : left.y * right);
        return result
    }
    
    static func * (left: Float, right: ChainPointFloat) -> ChainPointFloat{
        return right * left
    }
    
    static func /= (left: inout ChainPointFloat, right: Int) {
        left /= Float(right)
    }
    
    static func /= (left: inout ChainPointFloat, right: Float) {
        left.x = left.x / right
        left.y = left.y / right
    }
}
