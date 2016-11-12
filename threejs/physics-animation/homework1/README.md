## Physically Based Animation Homework1
    
### Simulation of 1 finite plane with 1 particle
- Gravity g = (0, 0, -10)
- mass of the particle m = 1
- radius of the particle r = 0.1
- find a proper dt
- Use Euler method to integrate O.D.E

### Make your system to change randomly upon a keyboard input
- Configuration of the plane changes like
    - p = ( frand(-1.5, -1.0), frand(-1.5, -1.0), frand(-0.2, 0.2) )
    - q = ( frand(1.0, 1.5), frand(-1.5, -1.0), frand(-0.2, 0.2) )
    - r = ( frand(1.0, 1.5), frand(1.0, 1.5), frand(-0.2, 0.2) )
    
- Initial state of the particle changes like
    - x = ( frand(-0.2, 0.2), frand(-0.2, 0.2), frand(2.0, 3.0) )
    - v = ( frand(-0.1, 0.1), frand(-0.1, 0.1), frand(-0.1, 0.1) )

### Demo Video
[![Link](http://img.youtube.com/vi/l4HXS3PgN_E/0.jpg)](http://www.youtube.com/watch?v=l4HXS3PgN_E)

due to Oct.15.2014