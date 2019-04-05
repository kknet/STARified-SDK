//
//  OutlineStrokeDrawingManager.m
//  outline_stroke_drawing_react
//
//  Created by Koretskiyil on 21/06/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>
#import <Foundation/Foundation.h>
#import "OutlineStrokeDrawingManager.h"

#import "OutlineStrokeDrawingView.h"

@interface OutlineStrokeDrawingManager()
@end

@implementation OutlineStrokeDrawingManager

RCT_EXPORT_MODULE()

static CGRect const MIN_FRAME = { { 0.0f, 0.0f }, { 64.0f, 64.0f } };

- (UIView *)view
{
  OutlineStrokeDrawingView * view = [[OutlineStrokeDrawingView alloc] initWithFrame:MIN_FRAME];
  return view;
}

//- (dispatch_queue_t)methodQueue
//{
//  return self.bridge.uiManager.methodQueue;
//}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXPORT_VIEW_PROPERTY(imageName, NSString);
RCT_EXPORT_VIEW_PROPERTY(layers, NSArray);

RCT_EXPORT_METHOD(save:(nonnull NSNumber *)reactTag
                  callback:(RCTResponseSenderBlock)callback)
{
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    id view = viewRegistry[reactTag];
    if ([view isKindOfClass:[OutlineStrokeDrawingView class]]) {
      OutlineStrokeDrawingView *strokeDrawingView = (OutlineStrokeDrawingView*)view;
      UIImage * result = [strokeDrawingView getStrokesImage];
      NSString * documentPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
      NSString * outputFilePath = [NSString stringWithFormat:@"%@/stroke.png", documentPath ];
      
      [UIImagePNGRepresentation(result) writeToFile:outputFilePath atomically:YES];
      callback(@[[NSNull null], outputFilePath]);
    }
  }];
}

@end

