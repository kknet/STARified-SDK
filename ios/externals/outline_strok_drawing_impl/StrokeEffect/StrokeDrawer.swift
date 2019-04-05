//
//  StrokeDrawer.swift
//  StrokeEffect
//
//  Created by Koretskiyil on 13/09/2017.
//  Copyright © 2017 ikoretskiy. All rights reserved.
//

import Foundation
import MetalKit
import Metal
import MetalPerformanceShaders


extension MTLTexture{
    func toArray<T>(width: Int, height: Int, featureChannels: Int, initial: T) -> [T] {
        assert(featureChannels != 3 && featureChannels <= 4, "channels must be 1, 2, or 4")
        
        var bytes = [T](repeating: initial, count: width * height * featureChannels)
        let region = MTLRegionMake2D(0, 0, width, height)
        getBytes(&bytes, bytesPerRow: width * featureChannels * MemoryLayout<T>.stride,
                 from: region, mipmapLevel: 0)
        return bytes
    }
}

public struct Stroke {
    
    /// Color of a stroke
    var color : Color;
    
    /// Reqired minimal width of a stroke
    var minWidth : Float;
    
    /// Reqired maximal width of a stroke
    var maxWidth : Float;
    
    /// Define how bumpy will be a stroke
    var randomnessLevel : Float;
    
    var offsetChangeFactor : Float;
    
    var widthChangeFactor : Float;
    
    var updateEveryNKeyPoints : Int;
    
    /// Offset of a stroke inside of the mask. A larger number will move a stroke deeper to the center
    var innerOffset : Float = 0.0;
    
    /// Shift of a stroke outside of the mask. Shift will move either inner and outer contours of a stroke
    var outerShift : Float = 0.0;
    
    ///
    var effects : [Effect] = [Effect]();
    
    ///
    var interpolationPointsCount : Int = 5 // add 5 new interpolated points
    
    private mutating func initEffects(){
        let normalOffsetEffect = NormalOffsetEffect(offset: innerOffset)
        effects.append(normalOffsetEffect)
        
        let pointUpdateFrequency = interpolationPointsCount * updateEveryNKeyPoints;

//        let randomWidthEffect = RandomWidthEffect(widthChangeFactor: randomnessLevel, minWidth: minWidth, maxWidth: maxWidth, updateEveryNPoints: pointUpdateFrequency)
        let randomWidthEffect = RandomWidthEffect(widthChangeFactor: widthChangeFactor, minWidth: minWidth, maxWidth: maxWidth, updateEveryNPoints: pointUpdateFrequency)
        effects.append(randomWidthEffect)
        
        if outerShift >= 0.01{
//            let randomShiftEffect = RandomShiftEffect(widthChangeFactor: randomnessLevel, minWidth: 0, maxWidth: self.outerShift, keypointDistance : interpolationPointsCount * 3)
            
            let randomShiftEffect = RandomShiftEffect(offsetChangeFactor: offsetChangeFactor, minOffset: 0, maxOffset: self.outerShift, updateEveryNPoints : pointUpdateFrequency )
            
            effects.append(randomShiftEffect)
        }

        // TODO Add waveEffect after i'll get requirements to the class 
        //        let waveEffect = RandomWaveEffect(keypointDistance: params.interpolationPointsCount, amplitude: 8.0, period: 7, offset: Int(3 * params.counter) )
        //
    }

    init(color : Color,
         minWidth : Float,
         maxWidth : Float,
         randomnessLevel : Float,
         updateEveryNKeyPoints : Int,
         offsetChangeFactor : Float,
         widthChangeFactor : Float,
         innerOffset : Float = 0.0,
         outerShift : Float = 0.0
         ){
        assert(randomnessLevel >= 0.0 && randomnessLevel <= 1.0)
        assert(minWidth < maxWidth)
        assert(minWidth >= 0.0)
        assert(maxWidth >= 0.0)
        
        self.color = color
        self.minWidth = minWidth
        self.maxWidth = maxWidth
        self.randomnessLevel = randomnessLevel
        self.innerOffset = innerOffset
        self.outerShift = outerShift
        self.offsetChangeFactor = offsetChangeFactor
        self.widthChangeFactor = widthChangeFactor
        self.updateEveryNKeyPoints = updateEveryNKeyPoints
        
        
        initEffects()
    }
}


@objc public class StrokeDrawer : NSObject{
    
    private var device : MTLDevice!
    private var commandQueue : MTLCommandQueue!
    private var pipelineState : MTLRenderPipelineState!
    
    private var renderCommandBuffer : MTLCommandBuffer?;
    private var renderEncoder : MTLRenderCommandEncoder?;
    
    private var dilate : MPSImageAreaMax!;
    private var erode : MPSImageAreaMin!;
    private var scale : MPSImageLanczosScale!;
    private var threshold : MPSImageThresholdBinary!;
    
    private var dilateTexture : MTLTexture!;
    private var erodeTexture : MTLTexture!;
    private var outputTexture : MTLTexture!;
    
    private var imgContours : [ContourFloat] = [ContourFloat]();
    
    
    let scaleFactor:Float = 4.0
    
    private var randomVal : UInt32 = 0;
    
    
    @objc public init(device : MTLDevice!, width : Int, height : Int){
        super.init();
        self.device = device
        self.commandQueue = device.makeCommandQueue()!
        initMetalShaders(width : width, height : height, scaleFactor: scaleFactor)
        initPipelineState(device: device)
        
    }
    
    private func initPipelineState(device : MTLDevice){
        let bundle = Bundle(for: StrokeDrawer.self)
        guard let library : MTLLibrary = try? device.makeDefaultLibrary(bundle: bundle) else {
            fatalError("Can't initialize library");
        }
        let vertexProgram = library.makeFunction(name: "basic_vertex")
        let fragmentProgram = library.makeFunction(name: "basic_fragment")
        //device.make
        
        let pipelineDescriptor = MTLRenderPipelineDescriptor()
        pipelineDescriptor.vertexFunction = vertexProgram
        pipelineDescriptor.fragmentFunction = fragmentProgram
        
        
        pipelineDescriptor.colorAttachments[0].pixelFormat = .bgra8Unorm_srgb
        
        pipelineDescriptor.colorAttachments[0].isBlendingEnabled = true
        pipelineDescriptor.colorAttachments[0].alphaBlendOperation = .add
        pipelineDescriptor.colorAttachments[0].rgbBlendOperation = .add
        
        pipelineDescriptor.colorAttachments[0].sourceRGBBlendFactor = .sourceAlpha
        pipelineDescriptor.colorAttachments[0].sourceAlphaBlendFactor = .sourceAlpha
        pipelineDescriptor.colorAttachments[0].destinationRGBBlendFactor = .oneMinusSourceAlpha
        pipelineDescriptor.colorAttachments[0].destinationAlphaBlendFactor = .oneMinusBlendAlpha
        
        
        do {
            pipelineState =
                try device.makeRenderPipelineState(descriptor: pipelineDescriptor)
        } catch let error as NSError {
            pipelineState = nil
            print("could not prepare render pipeline state \(error)")
        }
    }
    
    private func initMetalShaders(width : Int, height : Int, scaleFactor : Float){
        dilate = MPSImageAreaMax(device: device, kernelWidth: 5, kernelHeight: 5)
        erode = MPSImageAreaMin(device: device, kernelWidth: 5, kernelHeight: 5)
        
        // TODO replace Lanczos and threshold to the simple downsampling
        scale = MPSImageLanczosScale(device: self.device!)
        
        threshold = MPSImageThresholdBinary(device: device, thresholdValue: 0.01, maximumValue: 1.0, linearGrayColorTransform: nil)
        
        
        let out_descriptor = MTLTextureDescriptor.texture2DDescriptor(
            pixelFormat: MTLPixelFormat.r8Unorm,
            width:width / Int(scaleFactor),
            height: height / Int(scaleFactor),
            mipmapped: false)
        
        
        /// TODO why i can't just use .shaderWrite | .shaderRead here?
        let textureUsage = MTLTextureUsage(rawValue : UInt(UInt8(MTLTextureUsage.shaderWrite.rawValue) | UInt8(MTLTextureUsage.shaderRead.rawValue)))
        out_descriptor.usage = textureUsage
        
        dilateTexture = device.makeTexture(descriptor: out_descriptor);
        erodeTexture = device.makeTexture(descriptor: out_descriptor);
        
        
        let renderTextureUsage = MTLTextureUsage(rawValue :
            UInt(
                UInt8(MTLTextureUsage.shaderWrite.rawValue) |
                    UInt8(MTLTextureUsage.shaderRead.rawValue) |
                    UInt8(MTLTextureUsage.renderTarget.rawValue)
            )
        )
        out_descriptor.usage = renderTextureUsage
        outputTexture = device.makeTexture(descriptor: out_descriptor);
        
    }
    
    @objc public func convertStrokesAndDraw(img: MTLTexture, mask : MTLTexture, strokes : NSArray,  recalcContour : Bool, animationTick : UInt32 = 0) -> UIImage {
        
        var convertedStrokes = [Stroke]();
        
        for stroke in strokes{
            guard let strokeDict = stroke as? NSDictionary else {
                return UIImage();
            }
            
            //let color : NSString = strokeDict[ NSString(string: "color") as Any];
            let colorRepr : NSString = strokeDict["color"] as! NSString;
            let colorStr = String(colorRepr);
            
            let rgb = Int(colorStr[(colorStr.index(after: colorStr.startIndex))...], radix : 16)!;

            let red = (rgb >> 16) & 0xFF;
            let green = (rgb >> 8) & 0xFF;
            let blue =  rgb & 0xFF;
            
            let minWidth : NSNumber = strokeDict["minWidth"] as! NSNumber;
            let maxWidth : NSNumber = strokeDict["maxWidth"] as! NSNumber;
            let innerOffset : NSNumber = strokeDict["innerOffset"] as! NSNumber;
            let outerShift : NSNumber = strokeDict["outerShift"] as! NSNumber;
            let randomnessLevel : NSNumber = strokeDict["randomnessLevel"] as! NSNumber;
            
            let offsetChangeFactor : NSNumber = strokeDict["offsetChangeFactor"] as! NSNumber;
            let widthChangeFactor : NSNumber = strokeDict["widthChangeFactor"] as! NSNumber;
            let updateFrequency : NSNumber = strokeDict["updateFrequency"] as! NSNumber;
            
            let newStroke = Stroke(
                color : Color.makeNormalized(red, green, blue, 255),
                minWidth : minWidth.floatValue ,
                maxWidth : maxWidth.floatValue,
                randomnessLevel : randomnessLevel.floatValue,
                updateEveryNKeyPoints : updateFrequency.intValue,
                offsetChangeFactor : offsetChangeFactor.floatValue,
                widthChangeFactor : widthChangeFactor.floatValue,                
                innerOffset : innerOffset.floatValue,
                outerShift : outerShift.floatValue )
            
            
            convertedStrokes.append(newStroke);
        }
        
        var methodStart = Date()
        self.drawStrokes(img: img, mask : mask, strokes : convertedStrokes, recalcContour:recalcContour, animationTick : animationTick)
        var methodFinish = Date()
        var executionTime = methodFinish.timeIntervalSince(methodStart)
        print("drawStroke: \(executionTime)")

        methodStart = Date()

        var bytes = img.toArray(width: img.width, height: img.height, featureChannels: 4, initial: UInt8(0));

        for i in 0..<bytes.count/4 {
            bytes.swapAt(i*4 + 0, i*4 + 2)
        }
        let width = img.width;
        let height = img.height;
        if let context = CGContext(data: &bytes, width: width, height: height,
                                   bitsPerComponent: 8, bytesPerRow: width * 4,
                                   space: CGColorSpaceCreateDeviceRGB(),
                                   bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue),
            let cgImage = context.makeImage() {
            
            methodFinish = Date()
            executionTime = methodFinish.timeIntervalSince(methodStart)
            print("prepareImage: \(executionTime)")
            
            return UIImage(cgImage: cgImage, scale: 0, orientation: .up)
        } else {
            return UIImage();
        }
    }
    
    func downscaleAndFindChains(mask : MTLTexture) -> [ContourFloat]{
        // part of algorithm
        var methodStart = Date()
        let borderTexture = applyPreprocess(maskTexture: mask, scaleFactor: scaleFactor);
        var methodFinish = Date()
        var executionTime = methodFinish.timeIntervalSince(methodStart)
        //print("borderTexture: \(executionTime)")
        
        //renderTextureAsNSImage(texture: borderTexture)
        methodStart = Date()
        let contours : [ContourFloat] = findBiggestChain(borderTexture: borderTexture)
        methodFinish = Date()
        executionTime = methodFinish.timeIntervalSince(methodStart)
        print("findBiggestChain: \(executionTime)")
        return contours
    }
    
    public func drawStrokes(img: MTLTexture,
                            mask : MTLTexture,
                            strokes : [Stroke],
                            recalcContour : Bool,
                            animationTick : UInt32 = 0){
        //Don't process the same image twice without need.
        if (self.imgContours.count == 0 || recalcContour){
            self.imgContours = downscaleAndFindChains(mask : mask);
        }
        
        let contours : [ContourFloat] = self.imgContours;
        var  methodStart = Date()
        
        startDrawing(outputTexture: img)
        for stroke in strokes{
            for contour in contours{
                // Min samplingDistance
                let minSamplingDistance : Float = 1.0
                let maxSamplingDistance : Float = 30.0
                
                let samplingDistance = minSamplingDistance + (1.0 - stroke.randomnessLevel) * (maxSamplingDistance - minSamplingDistance)
                
                // TODO pass stroke directly without conversion to StrokeDataParams
                var params = StrokeDataParams(
                    color : stroke.color,
                    offset : stroke.innerOffset,
                    shiftRange : stroke.outerShift,
                    scaleFactor : Int(scaleFactor),
                    widthChangeFactor : stroke.randomnessLevel,
                    minStrokeWidth : stroke.minWidth,
                    maxStrokeWidth : stroke.maxWidth,
                    counter:animationTick )
                
                params.pointSamplinDistance = samplingDistance
                
                drawStroke(
                    edge: contour.points,
                    outputTexture : img,
                    params : params,
                    effects :  stroke.effects
                );
            }
        }
        endDrawing()
        
        var methodFinish = Date()
        var executionTime = methodFinish.timeIntervalSince(methodStart)
        print("Draw stroke: \(executionTime)")

    }
    
    private func applyPreprocess(maskTexture : MTLTexture, scaleFactor : Float) -> MTLTexture {
        let commandBuffer = commandQueue.makeCommandBuffer()
        
        var transform = MPSScaleTransform(
            scaleX: 1.0 / Double(scaleFactor),
            scaleY: 1.0 / Double(scaleFactor),
            translateX: 0,
            translateY: 0)
        
        withUnsafePointer(to: &transform) { (transformPtr: UnsafePointer<MPSScaleTransform>) -> () in
            scale.scaleTransform = transformPtr
            scale.encode(commandBuffer: commandBuffer!, sourceTexture: maskTexture, destinationTexture: outputTexture)
        }
        
        threshold.encode(commandBuffer: commandBuffer!, sourceTexture: outputTexture, destinationTexture: dilateTexture)
        erode.encode(commandBuffer: commandBuffer!, sourceTexture: dilateTexture, destinationTexture: erodeTexture);
        dilate.encode(commandBuffer: commandBuffer!, sourceTexture: erodeTexture, destinationTexture: outputTexture);
        
        commandBuffer?.commit()
        commandBuffer?.waitUntilCompleted()
        return outputTexture
    }
        
    
    private func findBiggestChain(borderTexture : MTLTexture) -> [ContourFloat] {
        let height = borderTexture.height;
        let width = borderTexture.width;
        
        let bytes = borderTexture.toArray(width: width, height: height, featureChannels: 1, initial: UInt8(0));
        // the result points chain
        let contourExtractor : ContourExtraction =  ContourExtraction(width : width, height : height)
        var contours:[ContourFloat] = [ContourFloat]()
        contourExtractor.findContours(data: bytes, contours: &contours)
        
        // For every point looking for a nearest point
        return contours
    }
    
    private func createDebugTextureWithReducedPointsCount(points : [ChainPointInt], width : Int, height : Int) -> MTLTexture {
        let out_descriptor = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: MTLPixelFormat.bgra8Unorm, width:width , height: height, mipmapped: false)
        
        let outTexture = device.makeTexture(descriptor: out_descriptor);
        
        //How can i get pixel format size in realtime?
        let pixelSize = 4
        
        var buf = [UInt8](repeating: 0, count: width*height * 4);
        
        for i in stride(from: 0, to: points.count, by: 1){
            let point : ChainPointInt = points[i]
            buf[pixelSize * Int(point.x) + pixelSize * Int(point.y) * width] = 255;
            
            //set alpha as visible
            buf[pixelSize * Int(point.x) + 3 + pixelSize * Int(point.y) * width] = 255;
        }
        
        let region = MTLRegionMake2D(0, 0, width, height)
        outTexture?.replace(region: region, mipmapLevel: 0, withBytes: &buf, bytesPerRow: width * pixelSize)
        
        return outTexture!;
    }
    
    func startDrawing(outputTexture : MTLTexture){
        let passDescriptor = MTLRenderPassDescriptor()
        let black = MTLClearColor(red: 0.0, green: 0.0,blue: 0.0, alpha: 0.0)
        passDescriptor.colorAttachments[0].loadAction = .clear
//        passDescriptor.colorAttachments[0].loadAction = .load
        passDescriptor.colorAttachments[0].clearColor = black
        passDescriptor.colorAttachments[0].storeAction = .store
        passDescriptor.colorAttachments[0].texture = outputTexture
        renderCommandBuffer = commandQueue.makeCommandBuffer()
        renderEncoder = renderCommandBuffer?.makeRenderCommandEncoder(descriptor: passDescriptor)
        renderEncoder?.setRenderPipelineState(pipelineState)
    }
    
    func endDrawing() {
        renderEncoder?.endEncoding()
        renderCommandBuffer?.commit()
    }
    
    func drawStroke(edge : [ChainPointFloat], outputTexture : MTLTexture, params : StrokeDataParams, effects : [Effect]){
        
        // TODO replace to an array of borders
        
        let strokeData = StrokeData(device: device, verticies: edge, width: outputTexture.width, height: outputTexture.height, params: params, effects : effects)
        renderEncoder?.setVertexBuffer(strokeData.vertexRightBorderBuffer, offset: 0, index: 0)
        renderEncoder?.drawPrimitives(type: .triangleStrip, vertexStart: 0, vertexCount: strokeData.vertexCount)
        renderEncoder?.setVertexBuffer(strokeData.vertexLeftBorderBuffer, offset: 0, index: 0)
        renderEncoder?.drawPrimitives(type: .triangleStrip, vertexStart: 0, vertexCount: strokeData.vertexCount)
        renderEncoder?.setVertexBuffer(strokeData.vertexBuffer, offset: 0, index: 0)
        renderEncoder?.drawPrimitives(type: .triangleStrip, vertexStart: 0, vertexCount: strokeData.vertexCount )
////
//        renderEncoder?.setVertexBuffer(strokeData.vertexBuffer, offset: 0, index: 0)
//        renderEncoder?.drawPrimitives(type: .line, vertexStart: 0, vertexCount: strokeData.vertexCount)
        
        
    }
}
