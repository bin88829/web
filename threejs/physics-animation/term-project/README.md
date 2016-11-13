## Physically Based Animation Term Project
Continued from [Homework2](https://github.com/bin88829/web/tree/master/threejs/physics-animation/homework2)

### Goal
1. Model a rope with multiple particles
2. Implement bending feature
3. Use of implicit integrator
4. Collision
    - Against surroundings
    - Rope / Rope interaction

### Procedure
1. Modeling
    - Particle
    - Rope
    - Plane
    - Cube
2. Implicit Method
    - Implicit Euler Integration
3. Collision
    - between Particle and Plane
    - between Ropes

### Result
1. Implicit Euler Method
[![Link](http://img.youtube.com/vi/urBGSMNdgpQ/0.jpg)](http://www.youtube.com/watch?v=urBGSMNdgpQ)

2. Explicit Euler Method
[![Link](http://img.youtube.com/vi/-FTIIJMbzqM/0.jpg)](http://www.youtube.com/watch?v=-FTIIJMbzqM)

### Conclusion
1. Collision particle and plane
    - Sometimes miss the collision (tunneling effect)
2. Collision between ropes method is not that efficient
3. Compare to explicit method
    - more stable