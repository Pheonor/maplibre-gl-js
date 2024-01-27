in vec3 a_pos3d;

uniform mat4 u_matrix;
uniform mat4 u_tile_matrix;
uniform mat4 u_globe_matrix;
uniform vec3 u_tile_coords;

out vec2 v_texture_pos;
out float v_depth;

#define PI 3.141592653589793

// EXTENT should be same value as in TypeScript part (extent.ts)
#define EXTENT 8192.0

// As a Tile could cover the whole Earth, EXTENT is the perimeter, so the radius is perimeter / (2.PI)
#define GLOBE_RADIUS EXTENT / PI / 2.0

// The convertion consider a simple round Globe
vec3 latLngToGlobePos(vec2 lat_lng) {
    lat_lng = lat_lng * PI / 180.0;
    float cos_lat = cos(lat_lng[0]);

    // Compute spherical coordinate (y vector as up vector)
    float globe_x =  cos_lat * sin(lat_lng[1]) * GLOBE_RADIUS;
    float globe_y = -sin(lat_lng[0])           * GLOBE_RADIUS;
    float globe_z =  cos_lat * cos(lat_lng[1]) * GLOBE_RADIUS;

    return vec3(globe_x, globe_y, globe_z);
}

// Same function as in Typescript part (mercator_coordinate.ts)
float mercatorXfromLng(float lng) {
    return (180.0 + lng) / 360.0;
}

// Same function as in Typescript part (mercator_coordinate.ts)
float mercatorYfromLat(float lat) {
    return (180.0 - (180.0 / PI * log(tan(PI / 4.0 + lat * PI / 360.0)))) / 360.0;
}

// Base on terrain vertex shader
void main() {
    // This shader have 2D coordinates as input.
    // It converts all position to 3D coordinates.

    // Extract (Lon,Lat) from tile coordinates
    vec4 lat_lng = u_tile_matrix * vec4(a_pos3d.xy, 0, 1);

    // Fill pole hole by extending mercator boundary to 90°
    if (lat_lng[0] > 85.0)
        lat_lng[0] = 90.0;
    if (lat_lng[0] < -85.0)
        lat_lng[0] = -90.0;

    // Convert to 3D position on Globe
    vec3 globe_pos = latLngToGlobePos(lat_lng.xy);
    // And apply current Globe orientation (center, zoom, pitch and bearing)
    vec4 globe_pos_world  = u_globe_matrix * vec4(globe_pos, 1);

    // Project globe position
    gl_Position = u_matrix * globe_pos_world;

    // Project UV on new 3D tile (compute real UV from mercator UV coordinate)
    float scale = u_tile_coords[0];
    float x = u_tile_coords[1];
    float y = u_tile_coords[2];
    
    // Compute 2D mercator position
    float mercator_y = mercatorYfromLat(lat_lng[0]);
    float mercator_x = mercatorXfromLng(lat_lng[1]);
    
    float uvX = mercator_x * scale - x;
    float uvY = mercator_y * scale - y;

    v_texture_pos = vec2(uvX, uvY);

    v_depth = gl_Position.z / gl_Position.w;
}
