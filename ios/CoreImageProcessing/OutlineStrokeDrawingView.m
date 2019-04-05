//
//  OutlintStrokeDrawingView.m
//  outline_stroke_drawing_react
//
//  Created by Koretskiyil on 21/06/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

// import UIView+React.h
#if __has_include(<React/UIView+React.h>)
#import <React/UIView+React.h>
#elif __has_include("UIView+React.h")
#import "UIView+React.h"
#else
#import "React/UIView+React.h"
#endif

#import "OutlineStrokeDrawingView.h"

@import StrokeEffectFramework;
@import MetalKit;

@interface OutlineStrokeDrawingView ()
@property id<MTLDevice> device;
@property StrokeDrawer* strokeDrawer;
@property id<MTLTexture> imgTexture;
@property id<MTLTexture> maskTexture;
@end


@implementation OutlineStrokeDrawingView {
  UIImageView * _imageView;
  NSArray * _layers;
}

- (instancetype) init {
  if (self = [super init]){
    self.device = MTLCreateSystemDefaultDevice();
    self.strokeDrawer = nil;
  }
  return self;
}

- (id)initWithFrame:(CGRect)aRect
{
  if ((self = [super initWithFrame:aRect])) {
    self.device = MTLCreateSystemDefaultDevice();
    self.strokeDrawer = nil;
  }
  return self;
}

- (void)reactSetFrame:(CGRect)frame
{
  [super reactSetFrame:frame];
  if (_imageView != nil) {
    [_imageView reactSetFrame:frame];
  }
}

- (void)setImageName:(NSString *)name {
  if (_imageView == nil){
    UIImage * image = [UIImage imageNamed:name];
    _imageView = [[UIImageView alloc] initWithImage:image];
    [self addSubview:_imageView];
  } else {
    UIImage * image = [UIImage imageNamed:name];
    [_imageView setImage:image];
  }
  [self initWithImage:name];
  
  if (_layers != nil){
    [self drawStrokes:_layers recalcContour:true];
  }
}

- (void)setLayers:(NSArray *)layers {
  _layers = layers;
  [self drawStrokes:layers recalcContour:false];
}

- (void) initWithImage : (NSString *)imgPath {
  NSError *err = nil;

  MTKTextureLoader * textureLoader = [[MTKTextureLoader alloc] initWithDevice:self.device];
  
  NSString *basePath = [imgPath stringByDeletingLastPathComponent];
  
  NSRange start = [imgPath rangeOfString:@"_processed_mask_"];
  NSUInteger startIndex = start.location + start.length;
  NSRange end = [imgPath rangeOfString:@".png"];
  NSUInteger endIndex = end.location + end.length;
  
  NSString *index = [imgPath substringWithRange:NSMakeRange(startIndex, end.location - startIndex)];
  
  NSString *newPath = [basePath stringByAppendingPathComponent: [NSString stringWithFormat:@"_processed_%@.png", index]];
  
  NSURL * url = [NSURL  fileURLWithPath:newPath];
  self.imgTexture = [textureLoader newTextureWithContentsOfURL: url
                                                       options:@{ MTKTextureLoaderOptionTextureUsage:
                                                                    [NSNumber numberWithUnsignedInteger:MTLTextureUsageRenderTarget],
                                                                  MTKTextureLoaderOptionOrigin : MTKTextureLoaderOriginTopLeft
                                                                  } error:&err];
  NSAssert(!err, [err description]);
  
  NSURL * urlMask = [NSURL  fileURLWithPath:imgPath];
  self.maskTexture = [textureLoader newTextureWithContentsOfURL:urlMask
                                                        options: @{
                                                                   MTKTextureLoaderOptionOrigin : MTKTextureLoaderOriginTopLeft
                                                                   }
                                                        error:nil];
  
  self.strokeDrawer = [[StrokeDrawer alloc] initWithDevice:self.device width: self.imgTexture.width height:self.imgTexture.height];
}

- (void) drawStrokes:(NSArray*)strokes
       recalcContour:(BOOL)recalcContour{
  if (self.strokeDrawer == nil){
    return;
  }
  NSDate *start = [NSDate date];
  self.resultImage= [self.strokeDrawer
                       convertStrokesAndDrawWithImg:self.imgTexture
                       mask:self.maskTexture
                       strokes:strokes
                       recalcContour:recalcContour
                       animationTick:0];
  [_imageView setImage:self.resultImage];
  NSLog(@"executionTime stroke drawing = %f", [start timeIntervalSinceNow]);
}

- (UIImage*) getStrokesImage {
  UIImage * result = self.resultImage;
  return result;
}

@end
