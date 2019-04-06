//
//  VideoExporter.m
//  Starify
//
//  Created by Igor Zinovev on 02.10.2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "LottieManager.h"
#import <AVFoundation/AVFoundation.h>
#import <React/RCTLog.h>
#import <React/UIView+React.h>
#import <React/RCTUtils.h>
#import <React/RCTConvert.h>
#import <React/RCTScrollView.h>
#import <React/RCTUIManager.h>
#if __has_include(<React/RCTUIManagerUtils.h>)
#import <React/RCTUIManagerUtils.h>
#endif
#import <React/RCTBridge.h>

#import "starified-Swift.h"

#import "LRNContainerView.h"
#import <Lottie/Lottie.h>


@implementation LottieManager


RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  return RCTGetUIManagerQueue();
}

RCT_EXPORT_METHOD(exportVideo:(nonnull NSNumber *)target
                  withAnimation:(nonnull NSNumber *)lottieTag
                  repeats:(nonnull NSNumber *) repeates
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  __block Spitfire *spitfire;
  
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    
    // Get view
    UIView *view;
    LOTAnimationView *lottie;
    
    
    if ([target intValue] == -1) {
      UIWindow *window = [[UIApplication sharedApplication] keyWindow];
      view = window.rootViewController.view;
    } else {
      view = viewRegistry[target];
    }
    
    LRNContainerView *lottieContainer = (LRNContainerView *)viewRegistry[lottieTag];
    lottie = (LOTAnimationView *)[lottieContainer valueForKey:@"_animationView"];

    spitfire = [[Spitfire alloc] init];
    
    if (!view) {
      reject(RCTErrorUnspecified, [NSString stringWithFormat:@"No view found with reactTag: %@", target], nil);
      return;
    }
    
    @try {
      int x = [repeates intValue];
      [spitfire makeVideoWith:lottie containerView:view repeats:x error:nil progress:^(NSProgress *progress) {
    
      } success:^(NSURL *url) {
        NSLog(@"%@", [spitfire class]);

        if (!url) {
          reject(RCTErrorUnspecified, [NSString stringWithFormat:@"There is no NSURL to exported file"], nil);
          return;
        }
        
        // We use this url on JS side for posting NSNotification about successfull video render to main app
        resolve(url.path);
      }];
    }
    @catch(NSException *exception) {
      reject(RCTErrorUnspecified, @"Unhandled expection while exporting video.", nil);
    }
  }];
}

RCT_EXPORT_METHOD(replaceLayers:(nonnull NSNumber *)lottieTag
                  imageUri:(nonnull NSString *)imageUri
                  keypaths:(nonnull NSArray*) keypaths
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {

    LOTAnimationView* lottie;
    
    
    LRNContainerView* lottieContainer = (LRNContainerView *) viewRegistry[lottieTag];
    lottie = (LOTAnimationView*) [lottieContainer valueForKey:@"_animationView"];
    
    UIImage* imageFrame = [UIImage imageWithContentsOfFile:imageUri];
    
    for  (NSString* keypath in keypaths) {
      UIImageView* imageView = [[UIImageView alloc] initWithImage:imageFrame];
      int width = 1500;
      int height = 1500;
      CGRect imageRect = CGRectMake( -width / 2, -height / 2,  width, height);
      
      imageView.frame = imageRect;
      imageView.layer.masksToBounds = true;
      
      LOTKeypath *keypathObj = [LOTKeypath keypathWithString:keypath];
      [lottie addSubview:imageView toKeypathLayer:keypathObj];
    }
    
    @try {
        resolve(@"succes");
      
    }
    @catch(NSException* exception) {
      reject(RCTErrorUnspecified, @"Unhandled expection while exporting video.", nil);
    }
  }];
}

@end



