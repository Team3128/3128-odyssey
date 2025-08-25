# Practicals

## Introduction

Code itself is not the only knowledge required to succeed in the Controls department. 
This documentation functions as a place to add any miscillaneous information, both on the software and wiring side, that will help members.

Authors: William Yuan (Wallim), Audrey Zheng, Maggie Liang, Lucas Han

## Swerve

### Cancoder Offsets
1. Set CANCoder offsets in SwerveConstants (e.g. `MOD0_CANCODER_OFFSET`) to `0` and deploy.
2. Align all wheels so each bevel faces the left of the robot.
3. Replace CANCoder offsets to the CANCoder offsets on Shuffleboard.

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

### Finding Robot MOI
1. Finding translational kA, run this command
```java
controller.getButton(kA).onTrue(
    swerve.characterize(0, 1, 10)
        .beforeStarting(() -> swerve.zeroLock())
);
```
2. Finding rotational kA, run this command
```java
controller.getButton(kA).onTrue(
    swerve.characterize(0, 1, 10)
        .beforeStarting(() -> swerve.oLock())
);
```
3. $MoI=mass\times\frac{trackwidth}{2}\times\frac{kA_{angular}}{kA_{linear}}$

## Vision Practicals

### Flashing an Orange Pi
When you first start using an Orange Pi, the micro SD card needs to be flashed with the Orange Pi image:

1. Connect the SD card to your computer using a dongle.
2. Download and open [Balena Etcher](https://etcher.balena.io/)
3. Go to [Orange Pi releases page](https://github.com/PhotonVision/photonvision/releases) and download the latest version of the Orange Pi 5 (orangepi5.img.xz)
4. Use Balena Etcher to flash the Orange Pi file onto the SD card. Put the SD Card into the Orange Pi

### Flashing Cameras:
1. With your computer and camera, directly connect to the camera's wifi using a radio.
2. Open photonvision in a new window using photonvision.local:5800. The dashboard should show the camera feed directly on your computer.
3. In dashboard, make sure the type is set to "AprilTag."
4. Rename the camera under the cameras tab. To access this camera in the future, use cameraname.local:5800 where cameraname is the new name.
5. Under the settings tab, change the team number to 3128.
6. For calibration, open the cameras tab and print out the calibration board (an 8x8 charuco board) by pressing generate board (skip if you already have a calibration board)
7. Under the cameras tab, scroll down and press "start calibration" and begin your calibration by holding up the charuco board to the camera and lining it up with the dots on the screen. Repeat this 12 or more times. Make sure your resolution is set to 1280x720. 
8. When finished, press "finish calibration" and verify that the cameras can recognize april tags by holding one up to a camera. If the calibration is successful, there should be lines indicating the orientation and location of the april tag.

## Radio Practicals

### Radio Firmware Update
1. On the Vivid-Hosting [firmware releases page](https://frc-radio.vivid-hosting.net/miscellaneous/firmware-releases) download the proper firmware for the current firmware version you have. Always choose the Radio Variant.
2. Copy the SHA-256 key below the firmware you downloaded.
3. Paste that key into the Checksum box of the Firmware Upload section at the bottom of the configuration page we navigated to above.
4. Click Browse… and select the firmware file you downloaded.
5. Click the Upload button.

### Robot Radio Configuration
This section is used for configuring the VH-109 radio outside of competition. At competition, configuration will be done by a provided computer and manual configuration using this page should not be used.

1. Select Robot Radio Mode
2. Enter the team number
3. Enter the suffix, if desired. This will help identify your robot and distinguish it from other networks.
4. Enter the 6 GHz WPA/SAE key. This key will need to match the key on the Access Point you configure.
5. Enter the 2.4 GHz WPA/SAE key. This is the password team members will type in when connecting to the 2.4 GHz network, if available.

## Submodule Practicals

### Setting up a Submodule
Submodules can be accessed and configured using the `git submodule` commands in the terminal.

### Removing Submodule and Directories
To remove submodule, directory, and related cache:
```
git rm [-f | --force] [-n] [-r] [--cached] [--ignore-unmatch] [--quiet] [--pathspec-from-file=<file> [--pathspec-file-nul]] [--] [<pathspec>…​]
```

```
git rm -r --cached libs/3128-common
```

### Adding Submodules
To add the submodule from the github cloud to the `libs/3128-common` destination:
```
git submodule [--quiet] add [-b "branch"] [-f|--force] [--name "name"] [--reference "repository"] [--] "repository" ["path"]
```

```
git submodule add https://github.com/Team3128/3128-common.git libs/3128-common
```
`--force` may be appended if required.

### Configuring Gradle Implementation
In order for projects in the main repository to access files from the submodules, the directory must be included in the gradle project, and it must be configured as an implementation. <br>

Navigate to the `settings.gradle` file in the main project and append the following inclusion and project:
```
include ':libs:3128-common'
project(':libs:3128-common').projectDir = file('libs/3128-common')
```
<br>

Navigate to the `build.gradle` file in the main project and add the project as a dependency:
```
dependencies {

    implementation project(':libs:3128-common')

	// other dependencies
}
```
<br>

Then `cd` into the submodules and build the gradle project. Starting from the main proejct:
```
cd libs/3128-common
./gradlew build
```
<br>

After, `cd` back to the main project and run a gralde build:
```
cd ../..
./gradlew build
```

### Quick Submodule Setup
1. Remove any existing directories or chache
```
git rm -r --cached libs/3128-common
```
2. Clone from default branch or specified branch: 
```
git submodule add https://github.com/Team3128/3128-common.git libs/3128-common
```
3. Include the project by navigating to `settings.gradle` and adding: 
```
include ':libs:3128-common'
project(':libs:3128-common').projectDir = file('libs/3128-common')
```
4. Add the dependency by navigating to `build.gralde` and adding:
```
dependencies {

    implementation project(':libs:3128-common')

	// other dependencies
}
```
5. Build the submodule project:
```
cd libs/3128-common
./gradlew build
```
6. Build the main project:
```
cd ../..
./gradlew build
```

### Basic Git Commands
The following is taken from the Git help page.

> To use these commands on a submodule, the `git submodule foreach` can be appended to the front to call for all modules, or the command can be called by navigating to the submodule directory.

To start a working area:
* `git clone`		Clone a repository into a new directory
* `git init`		Create an empty Git repository or reinitialize an existing one

To work on the current change
* `git add`			Add file contents to the index
* `git mv`			Move or rename a file, a directory, or a symlink
* `git restore`		Restory working tree files
* `git rm`			Remove files from the working tree and from the index

To examine the history and state:
* `git status`		Show the working tree status
* `git diff`		Show changes between commits, commit and working tree, ect.
* `git bisect`		Use binary search to fine the commit that introduced a bug
* `git grep`		Print lines matching a pattern
* `git log`			Show commit logs
* `git show`		Show various types of objects

To grow, mark, and tweak your common history:
* `git branch` 		List, create, or delete branches
* `git checkout`	Switch branches or restore working tree files
* `git commit`		Record changes to the repository
* `git merge`		Join two or more development histories together
* `git rebase`		Reapply commits on top of another base tip
* `git reset`		Reset current HEAD to the specified state
* `git revert`		Revert some existing commits
* `git stash`		Stach the changes in a dirty working directory away
* `git switch`		Switch branches
* `git submodule`	Initialize, update, or inspect submodules
* `git tag`			Create, list, delete, or verify a tag object signed with GPG

To collaborate:
* `git fetch`		Downlead objects and refs from another repository
* `git pull`		Fetch from and integrate with another repository or local branch
* `git push` 		Update remote refs along with associated objects