//
//  RefineViewManager.m
//  Starify
//
//  Created by Igor Zinovev on 30.10.2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>
#import "RefineViewManager.h"
#import <StarifySDK/StarifySDK-Swift.h>
#import "ImageBlender.h"

@implementation RefineViewManager

static NSInteger _counter = 0;

RCT_EXPORT_MODULE()

- (UIView *)view
{
  RefineView * view = [[RefineView alloc] init];
  return view;
}

RCT_EXPORT_VIEW_PROPERTY(background, NSString)

RCT_EXPORT_VIEW_PROPERTY(mask, NSString)

RCT_EXPORT_VIEW_PROPERTY(isErasing, BOOL)

RCT_EXPORT_VIEW_PROPERTY(strokeWidth, NSInteger)

RCT_EXPORT_METHOD(save:(nonnull NSNumber *)reactTag
                  callback:(RCTResponseSenderBlock)callback)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    id view = viewRegistry[reactTag];
    if ([view isKindOfClass:[RefineView class]]) {
      RefineView *refineView = (RefineView*)view;
      
      NSDictionary<NSString*, UIImage*> *results = [refineView save];
      
      NSString * documentPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
      
      UIImage* image = results[@"image"];
      UIImage* mask = results[@"mask"];
      UIImage* maskTransparent = results[@"maskTransparent"];
      
      NSString * outputFile = [NSString stringWithFormat:@"%@/_processed_%ld.png", documentPath, (long)_counter ];
      NSString * outputFileMask = [NSString stringWithFormat:@"%@/_processed_mask_%ld.png", documentPath, (long)_counter ];
      NSString * outputFileMaskTransparent = [NSString stringWithFormat:@"%@/_processed_mask_transparent_%ld.png", documentPath, (long)_counter ];
      NSString * outputFileFeathered = [NSString stringWithFormat:@"%@/_processed_mask_transparent_%ld.png", documentPath, (long)_counter ];
      
       UIImage* featheredImage = [ImageBlender blend:image];
      
      [UIImagePNGRepresentation(image) writeToFile:outputFile atomically:YES];
      [UIImagePNGRepresentation(mask) writeToFile:outputFileMask atomically:YES];
      [UIImagePNGRepresentation(maskTransparent) writeToFile:outputFileMaskTransparent atomically:YES];
      [UIImagePNGRepresentation(featheredImage) writeToFile:outputFileFeathered atomically:YES];
      
      _counter += 1;
      // we need to have different filenames to force react images to rerender. It was the most quick solution 
      callback(@[outputFile, outputFileMask, outputFileMaskTransparent, outputFileFeathered]);
    }
  }];
}

RCT_EXPORT_METHOD(revert:(nonnull NSNumber *)reactTag
                  callback:(RCTResponseSenderBlock)callback)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    id view = viewRegistry[reactTag];
    if ([view isKindOfClass:[RefineView class]]) {
      RefineView *refineView = (RefineView*)view;
      
      [refineView revert];
      callback(nil);
    }
  }];
}
@end
