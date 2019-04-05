//
//  ViewController.swift
//  StrokeEffect
//
//  Created by Koretskiyil on 09/09/2017.
//  Copyright © 2017 ikoretskiy. All rights reserved.
//

import UIKit
import MetalKit

private let WIDTH     = 1000
private let HEIGHT    = 1000

class ViewController: UIViewController  {
    
    var device : MTLDevice!
    
    var imageView: UIImageView!
    var backgroundImage: UIImageView!
    var maskTexture : MTLTexture!
    var maskTextureR8 : MTLTexture!
    var imgTexture : MTLTexture!

    var timer = Timer()
    
    var strokeDrawer : StrokeDrawer!
    var loader : MTKTextureLoader!
    
    var counter : UInt32 = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        initMetal()
        
        backgroundImage = UIImageView()
        backgroundImage.image = UIImage(named: "_processed")
        backgroundImage.frame = self.view.frame
        backgroundImage.contentMode = .scaleToFill
        backgroundImage.clipsToBounds = true
        view.addSubview(backgroundImage)
        
        imageView = UIImageView()
        imageView.frame  = self.view.frame
        imageView.contentMode = .scaleToFill
        imageView.clipsToBounds = true
        
        
        view.addSubview(imageView)
        
//        var methodStart = Date()
//            loadImgs()
//        var methodFinish = Date()
//        var executionTime = methodFinish.timeIntervalSince(methodStart)
//        print("Load imgs: \(executionTime)")
//
//        methodStart = Date()
//        //maskTextureR8 = convertToR8( maskTexture: maskTexture)
//        methodFinish = Date()
//        executionTime = methodFinish.timeIntervalSince(methodStart)
//        print("maskTextureR8: \(executionTime)")
        
        
        let maskTextureUrl = Bundle.main.url(forResource: "_processed_mask", withExtension: "png")!
        let imgTextureUrl = Bundle.main.url(forResource: "_processed", withExtension: "png")!
        
        loader = MTKTextureLoader(device: device)
        // MTKTextureLoader.Option.textureUsage :  MTLTextureUsage.renderTarget
        imgTexture =  try! self.loader.newTexture(URL: imgTextureUrl, options: [MTKTextureLoader.Option.origin: MTKTextureLoader.Origin.topLeft, MTKTextureLoader.Option.textureUsage: 0x04  ])
        
        maskTexture = try! self.loader.newTexture(URL: maskTextureUrl, options: [MTKTextureLoader.Option.origin:  MTKTextureLoader.Origin.topLeft])

    
        strokeDrawer = StrokeDrawer(device: device, width: imgTexture.width, height: imgTexture.height)
        let stroke1 = ["color": "#ff0000", "minWidth" : 3.0 , "maxWidth" : 8.0,
                        "randomnessLevel" : 0.8, "updateFrequency" : 20, "offsetChangeFactor" : 0.1, "widthChangeFactor": 0.1,
                        "innerOffset" : 10.0, "outerShift" : 20.0] as [String : Any]
        let strokes = NSMutableArray()
        strokes.add(stroke1)
        let resultImage: UIImage = strokeDrawer.convertStrokesAndDraw(img: imgTexture, mask: maskTexture, strokes:strokes, recalcContour: false)
        imageView.image = resultImage
        

//            [self.strokeDrawer
//            convertStrokesAndDrawWithImg:self.imgTexture
//            mask:self.maskTexture
//            strokes:strokes
//            recalcContour:recalcContour
//            animationTick:0];
//        [_imageView setImage:self.resultImage];
        
//        self.imgTexture = [textureLoader newTextureWithContentsOfURL: url
//            options:@{ MTKTextureLoaderOptionTextureUsage:
//            [NSNumber numberWithUnsignedInteger:MTLTextureUsageRenderTarget],
//            MTKTextureLoaderOptionOrigin : MTKTextureLoaderOriginTopLeft
//            } error:&err];
//
//        self.maskTexture = [textureLoader newTextureWithContentsOfURL:urlMask
//            options: @{
//            MTKTextureLoaderOptionOrigin : MTKTextureLoaderOriginTopLeft
//            }
//            error:nil];
        
//        strokeDrawer = StrokeDrawer(device: device, width: maskTextureR8.width, height: maskTextureR8.height)
//  updateImage()
//        timer = Timer.scheduledTimer(timeInterval: 0.2, target: self, selector: #selector(updateImage), userInfo: nil, repeats: true)

    }
    
    @objc func updateImage(){
        //TODO move img loading to the func
        let imgTextureUrl = Bundle.main.url(forResource: "src", withExtension: "jpg")!
        let options : [MTKTextureLoader.Option : Any] = [
            MTKTextureLoader.Option.origin : MTKTextureLoader.Origin.flippedVertically,
            MTKTextureLoader.Option.textureUsage : MTLTextureUsage.renderTarget.rawValue | MTLTextureUsage.shaderRead.rawValue
            ]
        
        do {
            imgTexture = try loader.newTexture(URL: imgTextureUrl, options: options)
        }
        catch _ { fatalError("Resource file cannot be loaded!") }

        /*
        let strokes = [
            Stroke(color : Color.makeNormalized(169, 214, 241, 255), minWidth : 29.0, maxWidth : 50.0, randomnessLevel : 0.2),
            Stroke(color : Color.makeNormalized(113, 189, 249, 255), minWidth : 21.0, maxWidth : 30.0, randomnessLevel : 0.7),
            Stroke(color : Color.makeNormalized(50,  141, 215, 255), minWidth : 11.0, maxWidth : 20.0, randomnessLevel : 0.8),
            Stroke(color : Color.makeNormalized(255, 255, 255, 255), minWidth : 3.0 , maxWidth : 8.0, randomnessLevel : 0.8, offset : 5.0)
        ]
         */
        
        let strokes = [
            Stroke(color : Color.makeNormalized(255, 255, 255, 255), minWidth : 3.0 , maxWidth : 8.0,
                   randomnessLevel : 0.8, updateEveryNKeyPoints : 20, offsetChangeFactor: 0.1, widthChangeFactor: 0.1,
                   innerOffset : 10.0, outerShift : 20.0 )
        ]
        
        counter += 2
        strokeDrawer.drawStrokes(img: imgTexture, mask: maskTextureR8, strokes: strokes, recalcContour: false,  animationTick : counter)
        
        renderTextureAsNSImage(texture: imgTexture)
        //timer.invalidate()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func loadImgs() {
        loader = MTKTextureLoader(device: device)
        let maskTextureUrl = Bundle.main.url(forResource: "mask_binarized", withExtension: "png")!
        let imgTextureUrl = Bundle.main.url(forResource: "src", withExtension: "png")!
        
        let options = [
            MTKTextureLoader.Option.origin : MTKTextureLoader.Origin.flippedVertically
        ]
        
        do {
            maskTexture = try loader.newTexture(URL: maskTextureUrl, options: options)
            imgTexture = try loader.newTexture(URL: imgTextureUrl, options: options)
        }
        catch _ { fatalError("Resource file cannot be loaded!") }
        
        
    }
    
    func renderTextureAsNSImage(texture: MTLTexture) {
        let ciTexture = CIImage(mtlTexture: texture, options: nil)!
        let uiimg = UIImage(ciImage: ciTexture)
        imageView.image = uiimg;
    }
    
    func convertToR8(maskTexture : MTLTexture ) -> MTLTexture{
        let width = maskTexture.width;
        let height = maskTexture.height;
        let featureChannels = 4;
        
        let bytes = maskTexture.toArray(width: width, height: height, featureChannels: featureChannels, initial: UInt8(0));
        
        var result_bytes = [UInt8](repeating: 0, count: width*height)
        
        for (out_idx, in_idx) in stride(from: 0, to: bytes.count, by: 4).enumerated(){
            result_bytes[out_idx] = bytes[in_idx]
        }
        
        
        let out_descriptor = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: MTLPixelFormat.r8Unorm, width:width , height: height, mipmapped: false)
        let out_texture = device.makeTexture(descriptor: out_descriptor);
        let region = MTLRegionMake2D(0, 0, width, height)
        out_texture?.replace(region: region, mipmapLevel: 0, withBytes: &result_bytes, bytesPerRow: width)
        return out_texture!;
    }
        
    
    func initMetal() {
        device = MTLCreateSystemDefaultDevice()
    }
}

