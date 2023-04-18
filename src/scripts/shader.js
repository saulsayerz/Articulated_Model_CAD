var vs_shader = `
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;
attribute vec2 a_texcoord;
attribute vec3 aVertexTangent;
attribute vec3 aVertexBitangent;

uniform mat4 u_normal;
uniform mat4 u_modelMatrix;
uniform mat4 u_projMatrix;
uniform mat4 u_viewMatrix;
uniform float u_fudgeFactor;

uniform int u_texture_mode;

varying highp vec3 v_lighting;
varying lowp vec4 v_color;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;
varying vec2 v_texcoord;

varying vec3 ts_light_pos;
varying vec3 ts_view_pos;
varying vec3 ts_frag_pos;

mat3 transpose(in mat3 inMatrix)
{
    vec3 i0 = inMatrix[0];
    vec3 i1 = inMatrix[1];
    vec3 i2 = inMatrix[2];

    mat3 outMatrix = mat3(
        vec3(i0.x, i1.x, i2.x),
        vec3(i0.y, i1.y, i2.y),
        vec3(i0.z, i1.z, i2.z)
    );

    return outMatrix;
}
void main(void) {
  mat4 uModelViewMatrix = u_viewMatrix * u_modelMatrix;
  gl_Position = u_projMatrix * uModelViewMatrix * a_position;
  float zToDivideBy = 1.0 + gl_Position.z * u_fudgeFactor;
  gl_Position = vec4(gl_Position.xy / zToDivideBy, gl_Position.zw);
  if (u_texture_mode == 0) {
    v_worldPosition = (uModelViewMatrix * a_position).xyz;
    v_worldNormal = mat3(uModelViewMatrix) * a_normal;
  } else if (u_texture_mode == 1) {
    v_texcoord = a_texcoord;
    highp vec3 ambient_light = vec3(0.3, 0.3, 0.3);
    highp vec3 directional_light_color = vec3(1, 1, 1);
    highp vec3 directional_light_direction = vec3(0.85, 0.8, 0.75);

    highp vec4 transformed_normal = u_normal * vec4(a_normal, 1.0);

    highp float directional = max(dot(transformed_normal.xyz, directional_light_direction), 0.0);
    v_lighting = ambient_light + (directional_light_color * directional);
  } else if (u_texture_mode == 2) {
    ts_frag_pos = vec3(uModelViewMatrix * a_position);

    vec3 T = normalize(mat3(uModelViewMatrix) * aVertexTangent);
    vec3 B = normalize(mat3(uModelViewMatrix) * aVertexBitangent);
    vec3 N = normalize(mat3(uModelViewMatrix) * a_normal);
    mat3 TBN = transpose(mat3(T, B, N));

    vec3 lightPos = vec3(0.0, 0.0, 0.0);
    ts_light_pos = TBN * lightPos;
    ts_view_pos = TBN * vec3(0.0, 0.0, 0.0);
    ts_frag_pos = TBN * ts_frag_pos;

    v_texcoord = a_texcoord;
  } else {
      v_color = a_color;
      highp vec3 ambient_light = vec3(0.3, 0.3, 0.3);
      highp vec3 directional_light_color = vec3(1, 1, 1);
      highp vec3 directional_light_direction = vec3(0.85, 0.8, 0.75);

      highp vec4 transformed_normal = u_normal * vec4(a_normal, 1.0);

      highp float directional = max(dot(transformed_normal.xyz, directional_light_direction), 0.0);
      v_lighting = ambient_light + (directional_light_color * directional);
  }
}`
var fs_shader = `
precision highp float;
// Passed in from the vertex shader.
varying highp vec3 v_lighting;
varying lowp vec4 v_color;
uniform bool u_shading;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;
varying highp vec2 v_texcoord;

uniform samplerCube u_texture;

uniform vec3 u_worldCameraPosition;

uniform int u_texture_mode_2;
uniform sampler2D u_sampler;

varying vec3 ts_light_pos;
varying vec3 ts_view_pos;
varying vec3 ts_frag_pos;


void main(void) {
  if (u_texture_mode_2 == 0) {
    vec3 worldNormal = normalize(v_worldNormal);
    vec3 eyeToSurfaceDir = normalize(v_worldPosition - u_worldCameraPosition);
    vec3 direction = reflect(eyeToSurfaceDir, worldNormal);
    gl_FragColor = textureCube(u_texture, direction);
  } else if (u_texture_mode_2 == 1) {
    highp vec4 texelColor = texture2D(u_sampler, v_texcoord);
    if (u_shading) {
      gl_FragColor = vec4(texelColor.rgb * v_lighting, texelColor.a);
    } else {
      gl_FragColor = texelColor;
    }
  } else if (u_texture_mode_2 == 2) {
    vec3 lightDir = normalize(ts_light_pos - ts_frag_pos);
    vec3 viewDir = normalize(ts_view_pos - ts_frag_pos);
    vec3 albedo = texture2D(u_sampler, v_texcoord).rgb;
    vec3 ambient = 0.3 * albedo;
    vec3 norm = normalize(texture2D(uampler, v_texcoord).rgb * 2.0 - 1.0);
    float diff = max(dot(lightDir, norm), 0.0);
    gl_FragColor = vec4(ambient + diff * albedo, 1.0);
  } else {
    if (u_shading) {
      gl_FragColor = vec4(v_color.rgb * v_lighting, v_color.a);
    } else {
      gl_FragColor = v_color;
    }
  }
}`