import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test cube
 */
const param ={}
param.count = 20000
param.size = .02
param.radius = 5
param.branches = 6
param.spin = 1
param.randomness = .2
param.power = 5
param.inside = '#ff6030'
param.outside = '#1b3984'

let geo = null
let material = null
let points = null 

const generate = () =>{

    if(points !== null){
        geo.dispose()
        material.dispose()
        scene.remove(points)
    }

    geo = new THREE.BufferGeometry()

    const positions = new Float32Array(param.count * 3)
    const colors = new Float32Array(param.count * 3)

    const colorInside = new THREE.Color(param.inside)
    const colorOutside = new THREE.Color(param.outside)
    for(let i = 0; i < param.count; i++){
        const i3 = i * 3

        const radius = Math.random() * param.radius
        const spinAngle = radius * param.spin
        const bAngle = (i % param.branches) / param.branches * Math.PI * 2
        const randomX = Math.pow(Math.random(), param.power) * (Math.random() < .5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), param.power) * (Math.random() < .5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), param.power) * (Math.random() < .5 ? 1 : -1)

        positions[i3 + 0] = Math.cos(bAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = 0 + randomY
        positions[i3 + 2] = Math.sin(bAngle + spinAngle) * radius + randomZ


        const mixed = colorInside.clone()
        mixed.lerp(colorOutside, radius / param.radius)
        colors[i3 + 0] = mixed.r
        colors[i3 + 1] =  mixed.g
        colors[i3 + 2] = mixed.b
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

     material = new THREE.PointsMaterial(
        {
            size: param.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        }
        
    )
    points = new THREE.Points(geo, material)
scene.add(points)
}




generate()
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

gui.add(param, 'count').min(100).max(100000).step(100).onFinishChange(generate)
gui.add(param, 'size').min(.001).max(.1).step(.001).onFinishChange(generate)
gui.add(param, 'radius').min(.01).max(20).step(.01).onFinishChange(generate)
gui.add(param, 'branches').min(2).max(20).step(1).onFinishChange(generate)
gui.add(param, 'spin').min(-5).max(5).step(.001).onFinishChange(generate)
gui.add(param, 'randomness').min(0).max(2).step(.001).onFinishChange(generate)
gui.add(param, 'power').min(1).max(10).step(.001).onFinishChange(generate)
gui.add(param, 'inside').onFinishChange(generate)
gui.add(param, 'outside').onFinishChange(generate)


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()