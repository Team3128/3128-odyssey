# Realign-Swerve

## Introduction

Info on how to realign the wheels with new swerve modules

Authors: Shravya Mandadi,


### Cancoder Offsets
1. Flip robot onto its side and align wheels so the geared side faces the **right** of robot (use 2x4 or some straight object to align):
![Image of wheel alignment](/images/realign-swerve.png)


2. Uncomment this line in RobotContainer.java (or add it if it's not there) and comment out whatever other command uses `controller.getButton(kY)`: 
```java
         controller.getButton(kY)
            .onTrue(swerve.identifyOffsetsCommand().ignoringDisable(true)); 
```
3. Deploy robot code
4. Start RioLog, press Y on the controller, wait 1 second, then press pause on RioLog. Something like this should generate (ignore numbers):
```java
public static final double MOD0_CANCODER_OFFSET = -66.35742187499999;
public static final double MOD1_CANCODER_OFFSET = 1.9335937499999998;
public static final double MOD2_CANCODER_OFFSET = 176.48437500000003;
public static final double MOD3_CANCODER_OFFSET = -11.689453125;
```
![Image of constants in riolog](/images/riolog.png)

5. Paste this into Constants.java and comment out old offsets
6. Deploy robot code and press the down button the controller to re-zero gyro
7. Done

### Debug Offsets
7. If any of the wheels appear to be turning in the wrong direction, +/- 180 to the offset (+ if its negative, - if its positive)









### Odometry doesn't work
1. Make sure motors __and CANCoders__ are ID'ed correctly. CANCoders may not be.



### ID'ing Swerve Devices
1. The module numbers are as follows, __in a top-down view__:
```
front
[0  1]
[2  3]
 back
```
2. Drive motors are `mod_num * 2 + 1`.
3. Angle motors are `mod_num * 2 + 2`.
4. CANCoders are `10 + mod_num`.
5. Pidgeon is `9`.
