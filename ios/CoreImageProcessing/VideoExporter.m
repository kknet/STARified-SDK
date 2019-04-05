//
//  VideoExporter.m
//  Starify
//
//  Created by Igor Zinovev on 02.10.2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "VideoExporter.h"
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

#import <StarifySDK/StarifySDK-Swift.h>

#import <LRNContainerView.h>
#import <Lottie/Lottie.h>


@implementation VideoExporter


RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  return RCTGetUIManagerQueue();
}

RCT_EXPORT_METHOD(export:(nonnull NSNumber *)target
                  withAnimation:(nonnull NSNumber *)lottieTag
                  repeats:(nonnull NSNumber *) repeates
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  __block Spitfire* spitfire;
  
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    
    // Get view
    UIView *view;
    LOTAnimationView* lottie;
    
    
    if ([target intValue] == -1) {
      UIWindow *window = [[UIApplication sharedApplication] keyWindow];
      view = window.rootViewController.view;
    } else {
      view = viewRegistry[target];
    }
    

    LRNContainerView* lottieContainer = (LRNContainerView *) viewRegistry[lottieTag];
    lottie = (LOTAnimationView*) [lottieContainer valueForKey:@"_animationView"];

    spitfire = [[Spitfire alloc] init];
    
    if (!view) {
      reject(RCTErrorUnspecified, [NSString stringWithFormat:@"No view found with reactTag: %@", target], nil);
      return;
    }
    
    @try {
      int x = [repeates intValue];
      [spitfire makeVideoWith:lottie containerView:view repeats: x error:nil progress:^(NSProgress* progres) {
    
      } success:^(NSURL* url) {
        NSLog(@"%@", [spitfire class]);
        resolve(@"succes");
      }];

    }
    @catch(NSException* exception) {
      reject(RCTErrorUnspecified, @"Unhandled expection while exporting video.", nil);
    }
  }];
}

@end



