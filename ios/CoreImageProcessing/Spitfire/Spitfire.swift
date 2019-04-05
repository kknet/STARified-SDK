//
//  Spitfire.swift
//  Pods
//
//  Created by seanmcneil on 3/8/17.
//
//

import AVFoundation
import Foundation
import Photos
import UIKit
import Lottie

@objc
public class Spitfire: NSObject {
  
  private var videoWriter: AVAssetWriter?
  
  private var outputURL: URL {
    let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0]
    let documentURL = URL(fileURLWithPath: documentsPath)
    
    return documentURL.appendingPathComponent("output.mov")
  }
  

  @objc
  public func makeVideo(with lottieView: LOTAnimationView, containerView: UIView, repeats: Int, progress: @escaping ((Progress) -> ()), success: @escaping ((URL) -> ())) throws {
    let size = CGSize(width: containerView.bounds.size.width * 2, height: containerView.bounds.size.height * 2)
    
    let fps = 30
    let framesMax = lottieView.animationDuration * CGFloat(fps)
    lottieView.loopAnimation = false
    lottieView.stop()
    
    
    try? FileManager.default.removeItem(at: outputURL)
    
    do {
      try videoWriter = AVAssetWriter(outputURL: outputURL, fileType: AVFileType.mov)
    } catch let error {
      throw(error)
    }
    
    guard let videoWriter = videoWriter else {
      throw(SpitfireError.VideoWriterFailure)
    }
    
    let videoSettings: [String : Any] = [
      AVVideoCodecKey  : AVVideoCodecType.h264,
      AVVideoWidthKey  : size.width,
      AVVideoHeightKey : size.height,
      ]
    
    let videoWriterInput = AVAssetWriterInput(mediaType: AVMediaType.video, outputSettings: videoSettings)
    
    let sourceBufferAttributes: [String : Any] = [
      (kCVPixelBufferPixelFormatTypeKey as String): Int(kCVPixelFormatType_32ARGB),
      (kCVPixelBufferWidthKey as String): Float(size.width),
      (kCVPixelBufferHeightKey as String): Float(size.height)]
    
    let pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(
      assetWriterInput: videoWriterInput,
      sourcePixelBufferAttributes: sourceBufferAttributes
    )
    
    assert(videoWriter.canAdd(videoWriterInput))
    videoWriter.add(videoWriterInput)
    
    if videoWriter.startWriting() {
      videoWriter.startSession(atSourceTime: CMTime.zero)
      assert(pixelBufferAdaptor.pixelBufferPool != nil)
      
      let writeQueue = DispatchQueue(label: "writeQueue", qos: .userInteractive)
      
      videoWriterInput.requestMediaDataWhenReady(on: writeQueue, using: { [weak self] in
        let frameDuration = CMTimeMake(value: 1, timescale: Int32(fps))
        let currentProgress = Progress(totalUnitCount: Int64(framesMax))
        var frameCount: Int64 = 0
        
        while(Int(frameCount) < Int(framesMax)) {
          // Will continue to loop until the video writer is able to write, which effectively handles buffer backups
          if videoWriterInput.isReadyForMoreMediaData {
            let lastFrameTime = CMTimeMake(value: frameCount, timescale: Int32(fps))
            let presentationTime = frameCount == 0 ? lastFrameTime : CMTimeAdd(lastFrameTime, frameDuration)
            
            
            let stringAttrs = [ NSAttributedString.Key.foregroundColor: UIColor.white, NSAttributedString.Key.font: UIFont(name: "HelveticaNeue-Thin", size: 36)!]
            let watermark = "Made with STARified"
            DispatchQueue.main.sync {
              
              lottieView.animationProgress = CGFloat(frameCount) / framesMax
              
              
              UIGraphicsBeginImageContextWithOptions(size, containerView.isOpaque, 0.0)
              containerView.drawHierarchy(in: CGRect(x:0, y:0, width: size.width, height: size.height), afterScreenUpdates: false)
              watermark.draw(at: CGPoint(x: 15, y: 15), withAttributes: stringAttrs)
              let image = UIGraphicsGetImageFromCurrentImageContext()
              UIGraphicsEndImageContext()
              
              do {
                try self?.append(pixelBufferAdaptor: pixelBufferAdaptor, with: image!, at: presentationTime, success: {
                  frameCount += 1
                  print(frameCount)
                  currentProgress.completedUnitCount = frameCount
                  progress(currentProgress)
                })
              } catch { } // Do not throw here
              
            }
          }
        }
        
        videoWriterInput.markAsFinished()
        videoWriter.finishWriting { [weak self] () -> Void in
          
          lottieView.loopAnimation = true
          
          guard let strongSelf = self else { return }
          
          if (repeats == 1) {
            PHPhotoLibrary.shared().performChanges({
              PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: strongSelf.outputURL)
            }) { saved, error in
              if saved {
                success(strongSelf.outputURL)
              }
            }
          } else {
            strongSelf.merge(url: strongSelf.outputURL, repeats: repeats, completion: {
              (exporter) in
              PHPhotoLibrary.shared().performChanges({
                PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: exporter.outputURL!)
              }) { saved, error in
                if saved {
                  success(exporter.outputURL!)
                }
              }
            })
          }

        }
      })
    }
  }
  
  func merge(url: URL, repeats:Int, completion:@escaping (_ exporter: AVAssetExportSession) -> ()) -> Void {
    
    let video = AVAsset(url: url)
    let mainComposition = AVMutableComposition()
    
    
    let compositionVideoTrack = mainComposition.addMutableTrack(withMediaType: AVMediaType.video, preferredTrackID: kCMPersistentTrackID_Invalid)
    var insertTime = CMTime.zero
    
    for _ in 0...repeats - 1 {
      try! compositionVideoTrack!.insertTimeRange(CMTimeRangeMake(start: CMTime.zero, duration: video.duration), of: video.tracks[0], at: insertTime)
      insertTime = CMTimeAdd(insertTime, video.duration)
    }
    
    let outputFileURL = URL(fileURLWithPath: NSTemporaryDirectory() + "result.mp4")
    
    try? FileManager.default.removeItem(at: outputFileURL)
    
    let exporter = AVAssetExportSession(asset: mainComposition, presetName: AVAssetExportPresetHighestQuality)
    
    exporter?.outputURL = outputFileURL
    exporter?.outputFileType = AVFileType.mp4
    exporter?.shouldOptimizeForNetworkUse = true
    
    exporter?.exportAsynchronously {
      DispatchQueue.main.async {
        completion(exporter!)
      }
    }
  }
}
