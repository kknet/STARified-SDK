//
//  Shaders.metal
//  StrokeEffect
//
//  Created by Koretskiyil on 12/09/2017.
//  Copyright © 2017 ikoretskiy. All rights reserved.
//

#include <metal_stdlib>
using namespace metal;

struct VertexIn{
    packed_float2 coord_in;
    packed_float4 color_in;
};

struct VertexOut{
    float4 coord_out [[position]];
    float4 color_out ;
};

vertex VertexOut basic_vertex(
    const device VertexIn* vertex_array [[ buffer(0) ]],
    unsigned int vid [[ vertex_id ]]) {
    
    VertexIn vertexIn = vertex_array[vid];
    
    VertexOut vertexOut;
    vertexOut.coord_out = float4(vertexIn.coord_in, 0.0, 1.0);
    vertexOut.color_out = vertexIn.color_in;

    return vertexOut;
}

fragment half4 basic_fragment(VertexOut coord_out [[stage_in]]) {
    float4 color = coord_out.color_out;
    return half4(color.r, color.g, color.b, color.a);
}
