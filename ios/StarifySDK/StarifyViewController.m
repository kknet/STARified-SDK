//
//  StarifyViewController.m
//  StarifySDK
//
//  Created by Dmitry Miller on 4/3/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "StarifyViewController.h"
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@interface StarifyViewController ()
@property (nonatomic) RCTBridge *bridge;
@property (nonatomic) RCTRootView *rootView;
@end

@implementation StarifyViewController

- (void)viewDidLoad {
  [super viewDidLoad];
  self.bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];
  self.rootView = [[RCTRootView alloc] initWithBridge:self.bridge
                                           moduleName:@"starified"
                                    initialProperties:nil];

  self.rootView.frame = self.view.bounds;
  [self.view addSubview:self.rootView];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  //return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  return [[NSBundle bundleForClass:self.class] URLForResource:@"main" withExtension:@"jsbundle"];
#else
  return [[NSBundle bundleForClass:self.class] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
