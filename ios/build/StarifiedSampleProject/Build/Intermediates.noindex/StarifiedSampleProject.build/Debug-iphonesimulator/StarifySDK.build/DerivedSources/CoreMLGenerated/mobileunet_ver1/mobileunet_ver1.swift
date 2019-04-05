//
// mobileunet_ver1.swift
//
// This file was automatically generated and should not be edited.
//

import CoreML


/// Model Prediction Input Type
@available(macOS 10.13, iOS 11.0, tvOS 11.0, watchOS 4.0, *)
class mobileunet_ver1Input : MLFeatureProvider {

    /// image as color (kCVPixelFormatType_32BGRA) image buffer, 512 pixels wide by 512 pixels high
    var image: CVPixelBuffer

    var featureNames: Set<String> {
        get {
            return ["image"]
        }
    }
    
    func featureValue(for featureName: String) -> MLFeatureValue? {
        if (featureName == "image") {
            return MLFeatureValue(pixelBuffer: image)
        }
        return nil
    }
    
    init(image: CVPixelBuffer) {
        self.image = image
    }
}

/// Model Prediction Output Type
@available(macOS 10.13, iOS 11.0, tvOS 11.0, watchOS 4.0, *)
class mobileunet_ver1Output : MLFeatureProvider {

    /// Source provided by CoreML

    private let provider : MLFeatureProvider


    /// output1 as 1 x 512 x 512 3-dimensional array of doubles
    lazy var output1: MLMultiArray = {
        [unowned self] in return self.provider.featureValue(for: "output1")!.multiArrayValue
    }()!

    var featureNames: Set<String> {
        return self.provider.featureNames
    }
    
    func featureValue(for featureName: String) -> MLFeatureValue? {
        return self.provider.featureValue(for: featureName)
    }

    init(output1: MLMultiArray) {
        self.provider = try! MLDictionaryFeatureProvider(dictionary: ["output1" : MLFeatureValue(multiArray: output1)])
    }

    init(features: MLFeatureProvider) {
        self.provider = features
    }
}


/// Class for model loading and prediction
@available(macOS 10.13, iOS 11.0, tvOS 11.0, watchOS 4.0, *)
class mobileunet_ver1 {
    var model: MLModel

/// URL of model assuming it was installed in the same bundle as this class
    class var urlOfModelInThisBundle : URL {
        let bundle = Bundle(for: mobileunet_ver1.self)
        return bundle.url(forResource: "mobileunet_ver1", withExtension:"mlmodelc")!
    }

    /**
        Construct a model with explicit path to mlmodelc file
        - parameters:
           - url: the file url of the model
           - throws: an NSError object that describes the problem
    */
    init(contentsOf url: URL) throws {
        self.model = try MLModel(contentsOf: url)
    }

    /// Construct a model that automatically loads the model from the app's bundle
    convenience init() {
        try! self.init(contentsOf: type(of:self).urlOfModelInThisBundle)
    }

    /**
        Construct a model with configuration
        - parameters:
           - configuration: the desired model configuration
           - throws: an NSError object that describes the problem
    */
    @available(macOS 10.14, iOS 12.0, tvOS 12.0, watchOS 5.0, *)
    convenience init(configuration: MLModelConfiguration) throws {
        try self.init(contentsOf: type(of:self).urlOfModelInThisBundle, configuration: configuration)
    }

    /**
        Construct a model with explicit path to mlmodelc file and configuration
        - parameters:
           - url: the file url of the model
           - configuration: the desired model configuration
           - throws: an NSError object that describes the problem
    */
    @available(macOS 10.14, iOS 12.0, tvOS 12.0, watchOS 5.0, *)
    init(contentsOf url: URL, configuration: MLModelConfiguration) throws {
        self.model = try MLModel(contentsOf: url, configuration: configuration)
    }

    /**
        Make a prediction using the structured interface
        - parameters:
           - input: the input to the prediction as mobileunet_ver1Input
        - throws: an NSError object that describes the problem
        - returns: the result of the prediction as mobileunet_ver1Output
    */
    func prediction(input: mobileunet_ver1Input) throws -> mobileunet_ver1Output {
        return try self.prediction(input: input, options: MLPredictionOptions())
    }

    /**
        Make a prediction using the structured interface
        - parameters:
           - input: the input to the prediction as mobileunet_ver1Input
           - options: prediction options 
        - throws: an NSError object that describes the problem
        - returns: the result of the prediction as mobileunet_ver1Output
    */
    func prediction(input: mobileunet_ver1Input, options: MLPredictionOptions) throws -> mobileunet_ver1Output {
        let outFeatures = try model.prediction(from: input, options:options)
        return mobileunet_ver1Output(features: outFeatures)
    }

    /**
        Make a prediction using the convenience interface
        - parameters:
            - image as color (kCVPixelFormatType_32BGRA) image buffer, 512 pixels wide by 512 pixels high
        - throws: an NSError object that describes the problem
        - returns: the result of the prediction as mobileunet_ver1Output
    */
    func prediction(image: CVPixelBuffer) throws -> mobileunet_ver1Output {
        let input_ = mobileunet_ver1Input(image: image)
        return try self.prediction(input: input_)
    }

    /**
        Make a batch prediction using the structured interface
        - parameters:
           - inputs: the inputs to the prediction as [mobileunet_ver1Input]
           - options: prediction options 
        - throws: an NSError object that describes the problem
        - returns: the result of the prediction as [mobileunet_ver1Output]
    */
    @available(macOS 10.14, iOS 12.0, tvOS 12.0, watchOS 5.0, *)
    func predictions(inputs: [mobileunet_ver1Input], options: MLPredictionOptions = MLPredictionOptions()) throws -> [mobileunet_ver1Output] {
        let batchIn = MLArrayBatchProvider(array: inputs)
        let batchOut = try model.predictions(from: batchIn, options: options)
        var results : [mobileunet_ver1Output] = []
        results.reserveCapacity(inputs.count)
        for i in 0..<batchOut.count {
            let outProvider = batchOut.features(at: i)
            let result =  mobileunet_ver1Output(features: outProvider)
            results.append(result)
        }
        return results
    }
}
