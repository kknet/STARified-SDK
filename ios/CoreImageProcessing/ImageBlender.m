//
//  ImageBlender.m
//  starified
//
//  Created by Igor Zinovev on 2/27/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "ImageBlender.h"

@implementation ImageBlender

+ (UIImage*) blend: (UIImage*) input {
  return [ImageBlender featherImageWith:input andDepth:6];
}


+ (UIImage*) featherImageWith:(UIImage*)input andDepth:(int)featherDepth {
  CGImageRef imageRef = input.CGImage;
  NSUInteger width = CGImageGetWidth(imageRef);
  NSUInteger height = CGImageGetHeight(imageRef);
  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
  unsigned char *rawData = (unsigned char*) calloc(height * width * 4, sizeof(unsigned char));
  NSUInteger bytesPerPixel = 4;
  NSUInteger bytesPerRow = bytesPerPixel * width;
  NSUInteger bitsPerComponent = 8;
  CGContextRef context = CGBitmapContextCreate(rawData, width, height,
                                               bitsPerComponent, bytesPerRow, colorSpace,
                                               kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
  CGColorSpaceRelease(colorSpace);
  
  CGContextDrawImage(context, CGRectMake(0, 0, width, height), imageRef);
  
  
  // Now your rawData contains the image data in the RGBA8888 pixel format.
  NSUInteger byteIndex = 0;
  
  NSUInteger rawDataCount = width*height;
  for (int i = 0 ; i < rawDataCount ; ++i, byteIndex += bytesPerPixel) {
    
    NSInteger alphaIndex = byteIndex + 3;
    
    if (rawData[alphaIndex] > 100) {
      
      for (int row = 1; row <= featherDepth; row++) {
        if (testBorderLayer((long)alphaIndex,
                            rawData,
                            (long)rawDataCount,
                            (long)width,
                            (long)height,
                            row)) {
          
          int destinationAlpha = 255 / (featherDepth+1) * (row + 1);
          double alphaDiv =  (double)destinationAlpha / (double)rawData[alphaIndex];
          
          rawData[alphaIndex] = destinationAlpha;
          rawData[alphaIndex-1] = (double)rawData[alphaIndex-1] * alphaDiv;
          rawData[alphaIndex-2] = (double)rawData[alphaIndex-2] * alphaDiv;
          rawData[alphaIndex-3] = (double)rawData[alphaIndex-3] * alphaDiv;
          
          
          break;
          
        }
      }
    }
  }
  
  
  CGImageRef newCGImage = CGBitmapContextCreateImage(context);
  
  UIImage *result = [UIImage imageWithCGImage:newCGImage scale:1.0 orientation:UIImageOrientationUp];
  
  CGImageRelease(newCGImage);
  
  CGContextRelease(context);
  free(rawData);
  
  return result;
}

bool testBorderLayer(long byteIndex,
                     unsigned char *imageData,
                     long dataSize,
                     long pWidth,
                     long pHeight,
                     int border) {
  
  
  int width = border * 2 + 1;
  int height = width - 2;
  
  // run thru border pixels
  // |-|
  // | |
  // |-|
  
  //top,bot - hor
  for (int i = 1; i < width - 1; i++) {
    
    
    long topIndex = byteIndex + 4 * ( - border * pWidth - border + i);
    long botIndex = byteIndex + 4 * ( border * pWidth - border + i);
    
    long destColl = byteIndex/4 % pWidth - border + i;
    
    if (destColl > 1 && destColl < pWidth) {
      if (testPoint(topIndex, imageData, dataSize) ||
          testPoint(botIndex, imageData, dataSize)) {
        return true;
      }
      
    }
    
  }
  
  
  //left,right - ver
  if (byteIndex / 4 % pWidth < pWidth - border - 1) {
    for (int k = 0; k < height; k++) {
      long rightIndex = byteIndex + 4 * ( border - (border) * pWidth + pWidth * k);
      
      if (testPoint(rightIndex, imageData, dataSize)) {
        return true;
      }
    }
  }
  
  if (byteIndex / 4 % pWidth > border) {
    
    for (int k = 0; k < height; k++) {
      long leftIndex = byteIndex + 4 * ( - border - (border) * pWidth + pWidth * k);
      
      if (testPoint(leftIndex, imageData, dataSize)) {
        return true;
      }
    }
  }
  
  return false;
}


//==============================================================================


bool testPoint(long pointIndex, unsigned char *imageData, long dataSize) {
  if (pointIndex >= 0 && pointIndex < dataSize * 4 - 1 &&
      imageData[pointIndex] < 30) {
    return true;
  }
  return false;
}
@end
