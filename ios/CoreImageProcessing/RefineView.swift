//
//  RefineView.swift
//  RefineView
//
//  Created by Igor Zinovev on 28.10.2018.
//  Copyright © 2018 Igor Zinovev. All rights reserved.
//

import Foundation
import UIKit

public class RefineView: UIView, UIScrollViewDelegate, UIGestureRecognizerDelegate {
    // scroll view for zooming
    var scrollView: UIScrollView
  
    // zooming needs single view
    var wrapperView: UIView
  
    // background image view
    var backgroundImageView: UIImageView
    
    // one view is for "current" line and second is result of merging current and mask
    var mainImageView: UIImageView
    var tempImageView: UIImageView
  
    // history stack
    var history: [UIImage]
  
    var lastPoint = CGPoint.zero
    var swiped = false
    
    // color and pen
    var red: CGFloat = 1.0
    var green: CGFloat = 0.0
    var blue: CGFloat = 0.0
    var brushWidth: CGFloat = 10.0
    var opacity: CGFloat = 0.5
    var isErasing = false
  
    // file paths
    var _background:String;
    var _mask:String;
  
    // if we in zoom, we can scroll with two fingers
    var inZoom = false
  
    //
    var drawingDidStarted = false;
  
    @objc(setBackground:)
    func setBackground(newValue: String) {
      _background = newValue
      if newValue != "" {
        backgroundImageView.image = UIImage(contentsOfFile: newValue)
      }
    }
  
    func getBackground() -> String {
      return _background
    }
  
    @objc(setMask:)
    func setMask(newValue: String) {
      _mask = newValue
      if newValue != "" {
        mainImageView.image = UIImage(contentsOfFile: newValue)?.withRenderingMode(.alwaysTemplate)
      }
    }
  
    func getMask() -> String {
      return _background
    }
    
    @objc(setIsErasing:)
    func setIsErasing(newValue: Bool) {
      isErasing = newValue
    }
  
    @objc(setStrokeWidth:)
    func setStrokeWidth(newValue: Int) {
      brushWidth = CGFloat(newValue)
    }

    override init(frame: CGRect) {
      backgroundImageView = UIImageView()
      mainImageView = UIImageView()
      tempImageView = UIImageView()
      scrollView = UIScrollView()
      wrapperView = UIView()
      history = [UIImage]()
      
      _background = ""
      _mask = ""
    
      super.init(frame: frame)
      
      self.scrollView.frame = CGRect(x: 0.0, y: 0.0, width: frame.width, height: frame.height)
      self.scrollView.contentSize = CGSize(width: 500, height: 500)
      
      
      scrollView.delegate = self
      // scrollView.delegatePass = self
      
      let screenWidth = UIScreen.main.bounds.width
      let minZoom = screenWidth / 1000.0
      
      scrollView.minimumZoomScale = CGFloat(minZoom)
      scrollView.zoomScale = CGFloat(minZoom)
      scrollView.maximumZoomScale = CGFloat(minZoom * 10.0)
      scrollView.isScrollEnabled = false
      
      
      let tapRec = SingleTouchDownGestureRecognizer(target: self, action: #selector(self.scrollViewTap(sender:)))
      tapRec.delegate = self
      scrollView.addGestureRecognizer(tapRec)
      
      self.addSubview(self.scrollView)
      
      self.wrapperView.frame = CGRect(x: 0, y: 0, width: 1000, height: 1000)
      self.scrollView.addSubview(wrapperView)
      
      self.backgroundImageView.frame = CGRect(x: 0.0, y: 0.0, width: 1000, height: 1000)
      wrapperView.addSubview(backgroundImageView)
      
      self.mainImageView.frame = CGRect(x: 0.0, y: 0.0, width: 1000, height: 1000)
      wrapperView.addSubview(mainImageView)
      
      self.tempImageView.frame = CGRect(x: 0.0, y: 0.0, width: 1000, height: 1000)
      wrapperView.addSubview(tempImageView)
    
      mainImageView.tintColor = UIColor(red: red, green: green, blue: blue, alpha: opacity )
      tempImageView.tintColor = UIColor(red: red, green: green, blue: blue, alpha: opacity )
    }

    @objc func scrollViewTap(sender: UIPanGestureRecognizer) {
      let point = sender.location(in: mainImageView)
      
      // user can start drawing with single finger and than put second one
      // to zoom or pan. If we started drawing, we need to finalize current work
      // and don't allow drawing until we get one finger one more time, beacuse we don't want
      // to draw if we zoom or pan
      let shouldRespond = drawingDidStarted || sender.numberOfTouches < 2

      
      //begin
      if ( sender.state == UIPanGestureRecognizer.State.began) {
        swiped = false
        lastPoint = point
      }
      
      //moved
      if ( sender.numberOfTouches < 2 && sender.state == UIPanGestureRecognizer.State.changed) {
        if (isErasing == true && drawingDidStarted == false) {
          tempImageView.image = mainImageView.image
          mainImageView.image = nil
        }
        
        drawingDidStarted = true
        
        
        swiped = true
        drawLineFrom(fromPoint: lastPoint, toPoint: point)
        lastPoint = point
      }
      
      //ended
      
      if (shouldRespond && sender.state == UIPanGestureRecognizer.State.ended) {
        if !swiped {
          // draw a single point
          drawLineFrom(fromPoint: lastPoint, toPoint: lastPoint)
        }
        
        // finilize current drawing
        drawingDidStarted = false
        
        // Merge tempImageView into mainImageView
        UIGraphicsBeginImageContext(mainImageView.frame.size)
        
        mainImageView.image?.draw(in: CGRect(x: 0, y: 0, width: 1000, height: 1000))
        tempImageView.image?.draw(in: CGRect(x: 0, y: 0, width: 1000, height: 1000))
        
        
        let resultedImg = UIGraphicsGetImageFromCurrentImageContext()?.withRenderingMode(.alwaysTemplate)
        UIGraphicsEndImageContext()
        
        history.append(resultedImg!)
        
        mainImageView.image = resultedImg
        tempImageView.image = nil
      }
      
    }
  
    func scrollViewDidZoom(_ scrollView: UIScrollView) {
      inZoom = true
      let imageViewSize = wrapperView.frame.size
      let scrollViewSize = scrollView.bounds.size
      
      let verticalInset = imageViewSize.height < scrollViewSize.height ? (scrollViewSize.height - imageViewSize.height) / 2 : 0
      let horizontalInset = imageViewSize.width < scrollViewSize.width ? (scrollViewSize.width - imageViewSize.width) / 2 : 0
      
      scrollView.contentInset = UIEdgeInsets(top: verticalInset, left: horizontalInset, bottom: verticalInset, right: horizontalInset)
    }

  override public func layoutSubviews() {
      super.layoutSubviews()
      self.scrollView.frame = self.bounds
    }
  
    func viewForZooming(in scrollView: UIScrollView) -> UIView? {
      return self.wrapperView
    }
    required init(coder aDecoder: NSCoder) {
      fatalError("This class does not support NSCoding")
    }
    
    func drawLineFrom(fromPoint: CGPoint, toPoint: CGPoint) {
      
      UIGraphicsBeginImageContext(self.tempImageView.frame.size)
      let context = UIGraphicsGetCurrentContext()
      tempImageView.image?.draw(in: CGRect(x: 0, y: 0, width: 1000, height: 1000))
      
      context?.move(to: fromPoint)
      context?.addLine(to: toPoint)
      
      context?.setLineWidth(brushWidth)
      context?.setLineCap(CGLineCap.round)
      
      if (isErasing) {
          context?.setBlendMode(CGBlendMode.clear)
          context?.strokePath()
          tempImageView.image = UIGraphicsGetImageFromCurrentImageContext()?.withRenderingMode(.alwaysTemplate)
        
      } else {
          context?.setBlendMode(CGBlendMode.normal)
          context?.setStrokeColor(red: 0.0, green: 0.0, blue: 0.0, alpha: 1.0)
          context?.strokePath()
          tempImageView.image = UIGraphicsGetImageFromCurrentImageContext()?.withRenderingMode(.alwaysTemplate)
      }
      
      UIGraphicsEndImageContext()
    }
  
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
      return true
    }
  
    @objc
    public func save() -> Dictionary<String, UIImage> {
      let size = backgroundImageView.image!.size
      let mask = mainImageView.image
      let image = backgroundImageView.image
      
      UIGraphicsBeginImageContext(size)
      let areaSize = CGRect(x: 0, y: 0, width: size.width, height: size.height)
      mask?.draw(in: areaSize)
      image?.draw(in: areaSize, blendMode: .sourceIn, alpha: 1.0);
      let newImage:UIImage = UIGraphicsGetImageFromCurrentImageContext()!
      UIGraphicsEndImageContext()
      
      var newImageMask : UIImage!;
      UIGraphicsBeginImageContext(size);
      mask?.draw(in: areaSize)
      newImageMask = UIGraphicsGetImageFromCurrentImageContext()!
      UIGraphicsEndImageContext()
      
      
      var newImageGrayscaledMask : UIImage!
      var blackAndWhite: UIImage!
      
      UIGraphicsBeginImageContext(size)
      let context = UIGraphicsGetCurrentContext()
      context?.setFillColor(UIColor.white.cgColor)
      context?.fill(areaSize)
      UIColor.black.setFill()
      mask?.draw(in: areaSize)
      blackAndWhite = UIGraphicsGetImageFromCurrentImageContext()!
      UIGraphicsEndImageContext()
      
      let colorspace = CGColorSpaceCreateDeviceGray();
      if let context = CGContext.init(data: nil, width: Int(size.width), height: Int(size.height), bitsPerComponent: 8, bytesPerRow: 0, space:  colorspace, bitmapInfo: CGImageAlphaInfo.none.rawValue) {
        
        context.draw((blackAndWhite?.cgImage!)!, in: areaSize);
        if let cgImage = context.makeImage() {
          newImageGrayscaledMask = UIImage(cgImage: cgImage, scale: 0, orientation: .up);
        }
      }
      
      return ["image": newImage,"mask": newImageGrayscaledMask, "maskTransparent": newImageMask]
    }
  
    @objc
    public func revert() {
      var _ = history.popLast()
      if (history.count > 0) {
        let topLayer = history.popLast()
        mainImageView.image = topLayer
        history.append(topLayer!)
      } else {
        mainImageView.image = UIImage(contentsOfFile: self._mask)?.withRenderingMode(.alwaysTemplate)
      }
    }
}

class SingleTouchDownGestureRecognizer: UIGestureRecognizer {
  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent) {
    if self.state == .possible {
      self.state = .began
    }
  }
  
  override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent) {
    if self.state == .possible {
      self.state = .changed
    }
  }
  override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent) {
    self.state = .ended
  }
}
