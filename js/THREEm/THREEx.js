import * as THREE from "./three.module.js";

var THREEx = THREEx || {};

/**
 * from http://stemkoski.blogspot.fr/2013/07/shaders-in-threejs-glow-and-halo.html
 * @return {[type]} [description]
 */
THREEx.createAtmosphereMaterial = function () {
	var vertexShader = [
		"varying vec3	vVertexWorldPosition;",
		"varying vec3	vVertexNormal;",

		"varying vec4	vFragColor;",

		"void main(){",
		"	vVertexNormal	= normalize(normalMatrix * normal);",

		"	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;",

		"	// set gl_Position",
		"	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
		"}",
	].join("\n");
	var fragmentShader = [
		"uniform vec3	glowColor;",
		"uniform float	coeficient;",
		"uniform float	power;",

		"varying vec3	vVertexNormal;",
		"varying vec3	vVertexWorldPosition;",

		"varying vec4	vFragColor;",

		"void main(){",
		"	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;",
		"	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;",
		"	viewCameraToVertex	= normalize(viewCameraToVertex);",
		"	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);",
		"	gl_FragColor		= vec4(glowColor, intensity);",
		"}",
	].join("\n");

	// create custom material from the shader code above
	//   that is within specially labeled script tags
	var material = new THREE.ShaderMaterial({
		uniforms: {
			coeficient: {
				type: "f",
				value: 1.0,
			},
			power: {
				type: "f",
				value: 2,
			},
			glowColor: {
				type: "c",
				value: new THREE.Color("pink"),
			},
		},
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		//blending	: THREE.AdditiveBlending,
		transparent: true,
		depthWrite: false,
	});
	return material;
};

THREEx.GeometricGlowMesh = function (mesh) {
	var object3d = new THREE.Object3D();

	var geometry = mesh.geometry.clone();
	//	THREEx.dilateGeometry(geometry, 0.01)
	geometry.scale(1.01, 1.01, 1.01);
	var material = THREEx.createAtmosphereMaterial();
	material.uniforms.glowColor.value = new THREE.Color("cyan");
	material.uniforms.coeficient.value = 1.1;
	material.uniforms.power.value = 1.4;
	var insideMesh = new THREE.Mesh(geometry, material);
	object3d.add(insideMesh);

	var geometry = mesh.geometry.clone();
	//	THREEx.dilateGeometry(geometry, 0.1)
	geometry.scale(1.01, 1.01, 1.01);
	var material = THREEx.createAtmosphereMaterial();
	material.uniforms.glowColor.value = new THREE.Color("cyan");
	material.uniforms.coeficient.value = 0.1;
	material.uniforms.power.value = 1.2;
	material.side = THREE.BackSide;
	var outsideMesh = new THREE.Mesh(geometry, material);
	object3d.add(outsideMesh);

	// expose a few variable
	this.object3d = object3d;
	this.insideMesh = insideMesh;
	this.outsideMesh = outsideMesh;
};

THREEx.dilateGeometry = function (geometry, length) {
	// gather vertexNormals from geometry.faces
	var vertexNormals = new Array(geometry.vertices.length);
	geometry.faces.forEach(function (face) {
		if (face instanceof THREE.Face4) {
			vertexNormals[face.a] = face.vertexNormals[0];
			vertexNormals[face.b] = face.vertexNormals[1];
			vertexNormals[face.c] = face.vertexNormals[2];
			vertexNormals[face.d] = face.vertexNormals[3];
		} else if (face instanceof THREE.Face3) {
			vertexNormals[face.a] = face.vertexNormals[0];
			vertexNormals[face.b] = face.vertexNormals[1];
			vertexNormals[face.c] = face.vertexNormals[2];
		} else console.assert(false);
	});
	// modify the vertices according to vertextNormal
	geometry.vertices.forEach(function (vertex, idx) {
		var vertexNormal = vertexNormals[idx];
		vertex.x += vertexNormal.x * length;
		vertex.y += vertexNormal.y * length;
		vertex.z += vertexNormal.z * length;
	});
};

export { THREEx };
