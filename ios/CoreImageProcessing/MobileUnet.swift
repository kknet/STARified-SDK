//
//  MobileUnet.swift
//  StarifiedNative2
//
//  Created by Koretskiyil on 05/05/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation


import UIKit
import CoreML
import Vision
import AVFoundation

@objc public class MobileUnet : NSObject{

  @objc public override  init() {
    super.init();
  }
  
  @objc public func processImage(inputImagePath : String) -> NSArray {
    
    guard let model = try? VNCoreMLModel(for: mobileunet_ver1().model) else
    {
      fatalError("Cannot launch crfrnn_converted_model")
    }
    
    // we make image to fit 1000x1000 square keeping aspect ratio
    // if image is smaller, for example user zooms out then cropping - we fit small image into bigger square
    // Input image shoudn't be bigger 1000x1000 - it's cropping lib responsibility, but in case it will be,
    // this should resize it well too(but it's not tested)
    let image = resizeImage(source: UIImage(contentsOfFile: inputImagePath)!)
    let fileUrl = URL(fileURLWithPath: inputImagePath)
    let ext = fileUrl.pathExtension
    
    do {
    if (ext == "png") {
      try image.pngData()?.write(to: fileUrl)
    } else if (ext == "jpg" || ext == "jpeg") {
      try image.jpegData(compressionQuality: 1.0)?.write(to: fileUrl)
      }
      
    } catch {
      print(error)
    }
    
    UIGraphicsBeginImageContext((image.size));
    var context = UIGraphicsGetCurrentContext();
    //context?.setAlpha(0.0);
    image.draw(at: CGPoint(x: 0, y: 0))
    let imageRotated = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext()
    
    let request = VNCoreMLRequest(model: model);
    
    var requestOptions:[VNImageOption : Any] = [:]
    let handler = VNImageRequestHandler(cgImage: (imageRotated?.cgImage!)!, options: requestOptions);
    
    request.imageCropAndScaleOption  = .scaleFill;
    let startDate = Date()
    do {
      try handler.perform([request]);
    }
    catch {
    }
    let diff = Date().timeIntervalSince(startDate)
    print(diff)
    guard let observations = request.results as? [VNCoreMLFeatureValueObservation] else {
      fatalError("unexpected result type from VNCoreMLRequest")
    }
    
    // convert to MLMultiArray and then convert to UIImage
    var mask: UIImage = UIImage()
    var maskGray: UIImage = UIImage()
    
    if let multiArray: MLMultiArray = observations[0].featureValue.multiArrayValue {
      (mask, maskGray) = maskToRGBA(maskArray: MultiArray<Double>(multiArray), rgba: (0, 0, 0, 255)) as! (UIImage, UIImage)
    }

    let (resultImage, maskGrayResized, maskTransparent) = mergeMaskAndBackground(mask: mask, image: imageRotated!, binaryMask: maskGray, size: 1500)
    
    var result : NSMutableArray = NSMutableArray();
    
    result.add(resultImage);
    result.add(maskGrayResized);
    result.add(maskTransparent);
    
    return result;
  }
  
  func maskToRGBA(maskArray: MultiArray<Double>,
                  rgba: (r: Double, g: Double, b: Double, a: Double)) -> (UIImage?, UIImage?) {
    let height = maskArray.shape[1]
    let width = maskArray.shape[2]
    var bytes = [UInt8](repeating: 0, count: height * width * 4)
    var bytesGray = [UInt8](repeating: 0, count: height * width)
    
    for h in 0..<height {
      for w in 0..<width {
        
        // Previously here was the code, to analyze image square border
        // pixels on border was painent diffrently and this was reason 1px border
        // not sure why this was implemented like what, but in case you need it - check git history
        var val = maskArray[0, h, w ];
        val = val > 0.5 ? 1.0 : 0.0
        let offset = h * width * 4 + w * 4
        
        bytes[offset + 0] = (1.0 * rgba.r).toUInt8
        bytes[offset + 1] = (1.0 * rgba.g).toUInt8
        bytes[offset + 2] = (1.0 * rgba.b).toUInt8
        bytes[offset + 3] = (val * rgba.a ).toUInt8
        
        let offsetGray = h * width + w
        bytesGray[offsetGray] = ( (1.0 - val) * rgba.a).toUInt8;
        
      }
    }
    
    let imageRGBA = UIImage.fromByteArray(bytes, width: width, height: height,
                                          scale: 0, orientation: .up,
                                          bytesPerRow: width * 4,
                                          colorSpace: CGColorSpaceCreateDeviceRGB(),
                                          alphaInfo: .premultipliedLast);
    
    let imageGray = UIImage.fromByteArray(bytesGray, width: width, height: height,
                                          scale: 0, orientation: .up,
                                          bytesPerRow: width,
                                          colorSpace: CGColorSpaceCreateDeviceGray(),
                                          alphaInfo: .none);

    return (imageRGBA, imageGray);
    //return (imageRGBA, imageRGBA);
  }
  
  func cropImageToSquare(image: UIImage) -> UIImage? {
    var imageHeight = image.size.height
    var imageWidth = image.size.width
    
    if imageHeight > imageWidth {
      imageHeight = imageWidth
    }
    else {
      imageWidth = imageHeight
    }
    
    let size = CGSize(width: imageWidth, height: imageHeight)
    let refWidth : CGFloat = CGFloat(image.cgImage!.width)
    let refHeight : CGFloat = CGFloat(image.cgImage!.height)
    
    let x = (refWidth - size.width) / 2
    let y = (refHeight - size.height) / 2
    
    let cropRect = CGRect(x: x, y: y, width: size.height, height: size.width)
    if let imageRef = image.cgImage!.cropping(to: cropRect) {
      return UIImage(cgImage: imageRef, scale: 0, orientation: image.imageOrientation)
    }
    
    return nil
  }
  
  func CGResizeSizeMax(size : CGSize , max : CGFloat ) -> CGSize {
    if (size.width > max || size.height > max) {
      if (size.width > size.height) {
        return CGSize(width: max, height : round(max * size.height / size.width));
      } else {
        return CGSize(width: round(max * size.width / size.height), height : max);
      }
    }
    return size;
  }

  func mergeMaskAndBackground(mask: UIImage, image: UIImage , binaryMask : UIImage, size: Int) -> (UIImage?, UIImage?, UIImage?){
    let maxSize = 1000;
    let size : CGSize = CGResizeSizeMax(  size: image.size, max: CGFloat(maxSize));
    
    UIGraphicsBeginImageContext(size)
    let areaSize = CGRect(x: 0, y: 0, width: size.width, height: size.height)
    mask.draw(in: areaSize)
    image.draw(in: areaSize, blendMode: .sourceIn, alpha: 1.0);
    let newImage:UIImage = UIGraphicsGetImageFromCurrentImageContext()!
    UIGraphicsEndImageContext()
    
    
    var newImageMask : UIImage?;
    var newTransparentImageMask : UIImage?;
    
// Outlines want mask to have white background, but for refine functions we need transparent background
// these method should return 3 image version
    UIGraphicsBeginImageContext(size);
    mask.draw(in: areaSize)
    newTransparentImageMask = UIGraphicsGetImageFromCurrentImageContext()!
    UIGraphicsEndImageContext()

    let colorspace = CGColorSpaceCreateDeviceGray();
    if let context = CGContext.init(data: nil, width: Int(size.width), height: Int(size.height), bitsPerComponent: 8, bytesPerRow: 0, space:  colorspace, bitmapInfo: CGImageAlphaInfo.none.rawValue) {
      
      context.draw(binaryMask.cgImage!, in: areaSize);
      if let cgImage = context.makeImage() {
        newImageMask = UIImage(cgImage: cgImage, scale: 0, orientation: .up);
      }
    }
    
    
    return (newImage, newImageMask, newTransparentImageMask)
  }
  
  func resizeImage(source:UIImage) -> UIImage{
    let scaledRect = AVMakeRect(aspectRatio: source.size, insideRect: CGRect(x: 0, y: 0, width: 1000, height: 1000  ))
    UIGraphicsBeginImageContext(CGSize(width:1000, height:1000))
    let ctx = UIGraphicsGetCurrentContext()
    ctx?.setFillColor(UIColor.black.cgColor)
    ctx?.fill(CGRect(x: 0, y: 0, width: 1000, height: 1000  ))
    source.draw(in: scaledRect)
    let newImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return newImage!
  }
}
