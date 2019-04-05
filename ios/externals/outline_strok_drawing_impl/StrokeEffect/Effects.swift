//
//  Effects.swift
//  StrokeEffect
//
//  Created by Koretskiyil on 05/10/2017.
//  Copyright © 2017 ikoretskiy. All rights reserved.
//

import Foundation


public class Effect{
    public func apply(outerPoint: inout ChainPointFloat, innerPoint: inout ChainPointFloat , cosAngle : Float, sinAngle : Float){
        
    }
}

public class NormalOffsetEffect : Effect{
    private var offset : Float
    
    override public func apply(outerPoint: inout ChainPointFloat, innerPoint: inout ChainPointFloat , cosAngle : Float, sinAngle : Float){
        outerPoint.x += -cosAngle * offset
        outerPoint.y += -sinAngle * offset
        
        innerPoint.x += -cosAngle * offset
        innerPoint.y += -sinAngle * offset
    }
    
    init (offset : Float){
        self.offset = offset
    }
    
}

public class WaveEffect : Effect {
    private var counter : Int = 0
    private var keypointDistance : Int = 1;
    private var amplitude : Float;
    private var period : Float;
    private var offset : Int;
    
    override public func apply(outerPoint: inout ChainPointFloat, innerPoint: inout ChainPointFloat , cosAngle : Float, sinAngle : Float){
        
        let step : Float = 360.0 / period
        
        let angle : Float = self.amplitude * sin(Float(counter + offset) * step * Float.pi / 180.0)
        
        //var curAmplitude : Float = Float(arc4random_uniform(UInt32(amplitude)))
        
        outerPoint.x += cosAngle * angle
        outerPoint.y += sinAngle * angle
        
        innerPoint.x += cosAngle * angle
        innerPoint.y += sinAngle * angle
        counter += 1
    }
    
    init(keypointDistance : Int, amplitude : Float, period : Int, offset : Int){
        self.keypointDistance = keypointDistance
        self.period = Float(period) * Float(keypointDistance)
        self.amplitude = amplitude
        self.offset = offset
    }
}

public class RandomWaveEffect : Effect {
    private var counter : Int = 0
    private var keypointDistance : Int = 1;
    private var amplitude : Float;
    private var period : Float;
    private var offset : Int;
    
    private var keepForNextKPoints : Int;
    
    private var currentPeriod : Float!;
    private var currentAmplitude : Float!;
    
    
    override public func apply(outerPoint: inout ChainPointFloat, innerPoint: inout ChainPointFloat , cosAngle : Float, sinAngle : Float){
        
        if keepForNextKPoints == 0 {
            updateParams()
        }

        let step : Float = 360.0 / currentPeriod
        let angle : Float = currentAmplitude * sin(Float(counter + offset) * step * Float.pi / 180.0)
        
        outerPoint.x += cosAngle * angle
        outerPoint.y += sinAngle * angle
        
        innerPoint.x += cosAngle * angle
        innerPoint.y += sinAngle * angle
        counter += 1
        keepForNextKPoints -= 1
    }
    
    private func updateParams(){
        let variableRange : UInt32 = UInt32(self.period) / 4
        let randomRange : Int = Int(arc4random_uniform(2 * variableRange)) - Int(variableRange)
        keepForNextKPoints = Int(self.period) + randomRange
        currentPeriod = Float(keepForNextKPoints)
    
        let variableAmplitudeRange : UInt32 = UInt32(self.amplitude) / 4
        let randomAmplitudeRange : Float = Float(arc4random_uniform(2 * variableAmplitudeRange)) - Float(variableAmplitudeRange)
        currentAmplitude = self.amplitude + randomAmplitudeRange
    }
    
    init(keypointDistance : Int, amplitude : Float, period : Int, offset : Int){
        self.keypointDistance = keypointDistance
        self.period = Float(period) * Float(keypointDistance)
        self.amplitude = amplitude
        self.offset = offset
        
        currentPeriod = 0.0
        currentAmplitude  = 0.0
        keepForNextKPoints = 10;
        
        super.init()
        updateParams()
    }
}


public class LightingEffect : Effect {
    private var counter : Int = 0
    private var keypointDistance : Int = 1;
    private var amplitude : Float;
    private var period : Float;
    private var offset : Int;
    
    override public func apply(outerPoint: inout ChainPointFloat, innerPoint: inout ChainPointFloat , cosAngle : Float, sinAngle : Float){
        
        let step : Float = 360.0 / period
        
        
        let curAmplitude : Float = Float(arc4random_uniform(UInt32(amplitude)))
        
        let angle : Float = curAmplitude * sin(Float(counter + offset) * step * Float.pi / 180.0)
        
        outerPoint.x += cosAngle * angle * curAmplitude
        outerPoint.y += sinAngle * angle * curAmplitude
        
        innerPoint.x += cosAngle * angle * curAmplitude
        innerPoint.y += sinAngle * angle * curAmplitude
        counter += 1
    }
    
    init(keypointDistance : Int, amplitude : Float, period : Int, offset : Int){
        self.keypointDistance = keypointDistance
        self.period = Float(period) * Float(keypointDistance)
        self.amplitude = amplitude
        self.offset = offset
    }
}


public class RandomShiftEffect : Effect {
    private var counter : Int = 0
    private var updateRandomSignEvery : Int // update sign every K iterations
    private var changeOffsetSign : Int = 0
    private var minOffset : Float
    private var maxOffset : Float
    private var prevOffset : Float
    private var initialOffset  : Float
    private var offsetChangeFactor : Float = 0.0;
//    private var keypointDistance : Int = 1;
    
    //offsetChangeFactor - how much we can change distance of the next point. Lay in between minOffset and maxOffset.
    //offsetChangeFactor  * (maxOffset - minOffset)
    //But offset can't be less than minOffset and more than maxOffset
    init(offsetChangeFactor : Float, minOffset : Float, maxOffset : Float, updateEveryNPoints : Int){
        assert(offsetChangeFactor >= 0.0 && offsetChangeFactor  <= 1.0)
        // 1 -> 1
        // 0.8 -> 2
        //....
        // 0.2 -> 5
        //self.keypointDistance = keypointDistance
        
        //let updateSignCoef : Int = //Int((1.0 - offsetChangeFactor) * 5.0 + 1.0)
        
        self.offsetChangeFactor = offsetChangeFactor;//offsetChangeFactor / Float(keypointDistance)
        
        updateRandomSignEvery = updateEveryNPoints;
        changeOffsetSign = Int(arc4random_uniform(3)) - 1;
        
        self.minOffset = minOffset
        self.maxOffset = maxOffset
        self.initialOffset = (maxOffset + minOffset) / 2.0
        self.prevOffset = self.initialOffset
    }
    
    override public func apply(outerPoint: inout ChainPointFloat, innerPoint: inout ChainPointFloat , cosAngle : Float, sinAngle : Float){
        
        if self.counter % updateRandomSignEvery == 0{
            // generate a new sign
            changeOffsetSign = Int(arc4random_uniform(3)) - 1
        }
        let maxChangeOffsetPerPoint : Float = offsetChangeFactor   * (maxOffset - minOffset);
        let nextOffsetShift : Float = getNewWidthShift(range : maxChangeOffsetPerPoint)
        let nextOffset : Float = max(min(prevOffset + Float(changeOffsetSign) * nextOffsetShift, maxOffset), minOffset)
        
        outerPoint.x += cosAngle * nextOffset
        outerPoint.y += sinAngle * nextOffset
        
        innerPoint.x += cosAngle * nextOffset
        innerPoint.y += sinAngle * nextOffset
        
        self.counter += 1
        
        prevOffset = nextOffset
    }
    
    ///
    private func getNewWidthShift(range : Float) -> Float {
        let discritizationLevel : UInt32 = 1000
        let generatedLevel = Float(arc4random_uniform(discritizationLevel))
        let nextWidthShift = generatedLevel * range / Float(discritizationLevel)
        return nextWidthShift
    }
}


public class RandomWidthEffect : Effect{
    private var counter : UInt32 = 0
    private var updateEveryNPoints : UInt32 // update sign every K iterations
    private var changeWidthSign : Int = 0
    private var minWidth : Float = 0.0
    private var maxWidth : Float = 0.0
    private var prevWidth : Float = 0.0;
    private var nextWidth : Float = 0.0;
    private var widthChangeFactor : Float = 0.0;
    private var keypointDistance : Int = 1;
    private var updateSignCounter : UInt32 = 0;
    
    init(widthChangeFactor : Float, minWidth : Float, maxWidth : Float, updateEveryNPoints : Int){
        assert(widthChangeFactor >= 0.0 && widthChangeFactor  <= 1.0)
        // 1 -> 1
        // 0.8 -> 2
        //....
        // 0.2 -> 5
        //        self.keypointDistance = keypointDistance
        
        //        let updateSignCoef : Int = Int((1.0 - widthChangeFactor) * 5.0 + 1.0)
        self.widthChangeFactor = widthChangeFactor
        self.updateEveryNPoints = UInt32(updateEveryNPoints);// Int(updateSignCoef * keypointDistance)
        self.updateSignCounter = UInt32(updateEveryNPoints)
        changeWidthSign = Int(arc4random_uniform(3)) - 1;
        
        self.minWidth = minWidth
        self.maxWidth = maxWidth
        prevWidth = (maxWidth + minWidth) / 2.0
    }
    
    override public func apply(outerPoint: inout ChainPointFloat, innerPoint: inout ChainPointFloat , cosAngle : Float, sinAngle : Float){
        
        //if self.counter % updateRandomSignEvery == 0{
        if self.counter == self.updateSignCounter{
            self.updateSignCounter = self.counter + arc4random_uniform(updateEveryNPoints / 2) + updateEveryNPoints / 2
            //changeWidthSign = Int(arc4random_uniform(3)) - 1 // generating between  -1 ; 1
            let newSign = Int(arc4random_uniform(2)) // generating between  -1 ; 1
            if (newSign == 1){
                changeWidthSign = 1;
            } else {
                changeWidthSign = -1;
            }
        }
        let maxChangeWidthPerPoint : Float = widthChangeFactor * (maxWidth - minWidth);
        let nextWidthShift : Float = getNewWidthShift(range : maxChangeWidthPerPoint)
        let nextWidth : Float = max(min(prevWidth + Float(changeWidthSign) * nextWidthShift, maxWidth), minWidth)
        
        outerPoint.x += cosAngle * nextWidth
        outerPoint.y += sinAngle * nextWidth
        
        self.counter += 1
        prevWidth = nextWidth
    }
    
    ///
    private func getNewWidthShift(range : Float) -> Float {
        let discritizationLevel : UInt32 = 100
        let generatedLevel = Float(arc4random_uniform(discritizationLevel))
        let nextWidthShift = generatedLevel * range / Float(discritizationLevel)
        return nextWidthShift
    }
    
}
