# Common
## Preamble
This documentation outlines the various practices that we want to uphold to keep our organization clear, streamlined, and structured for our common repository. 
This includes BOTH GITHUB and CODE structure.

Authors: William Yuan (Wallim), Teja Yaramada

## Prefix Info
There will be NO FORKS, ONLY BRANCHES

__Defining “good enough”:__

- Code reviewed
- Tested on physical components (Off robot testing)
- Can vary specifically per project (Milestones)
  - Criteria based off of functionalities implemented by strat and mech
  - Quantify success criteria with verification process
  - Goal oriented enhancements

__Defining “push often” (NOT time based):__

- Code does not need to be complete when pushed
- Code should not have broken code, compilable
  - If something is crucially incomplete, put a comment or a placeholder:
  ```
  //TODO
  //FIX THIS
  //NOTE
  temp variables
  ```
  - Should be able to be searched up to be corrected
 
__Code reviewing__

- EVERYONE can code review, in fact it is encouraged
  - However, this does not entail that you are allowed to accept pull requests

- Being a Request Manager
  - Software Lead + Dept Coord
  - Experienced upperclassmen, project-lead
  - Understand issues
    - Sloppiness, awful structure
    - Logic flaw (typically very hidden, hard to detect)
  - Multiple request managers can review a pull request

## Repository Structure and Branches
__THERE IS ONLY ONE, CONSTANT THROUGHOUT ALL YEARS__

### MAIN
This is the __ROOT__ branch, also known as the __COMP READY BRANCH__

__NO JUNK IN MAIN__ Code here should be clean, “good enough” to compete  

__DEV -> MAIN__ Only branch that can push to main is the dev branch

Once there is a new push, a new OFFICIAL RELEASE will be created to Github

- Program Lead + Dept Coord Job

### COMP
__Branches only off main__

__Purpose__ make any quick (sloppy) and ESSENTIAL changes during comp, away from MAIN

__!!!ATTENTION!!!__ WE SHOULD NOT IN 99.99% OF CASES EVER MAKE A COMP BRANCH FOR COMMON REPO. WE ONLY MAKE ONE IF LOGIC WITHIN THE COMP READY COMMON IS SO FUNDEMENTALLY FLAWED IT CAUSES US TO LOSE THE COMPETITION

__MAIN -> COMP -> DEV__ once the comp is OVER, this branch will NOT be pushed back into main, rather worked on/clean up/corrected in dev

__Naming__

- Branch:
> {comp}_{year}
- Push to branch:
> {comp} day {1,2,3...} {datetime}
> __(Should be done every night after a comp day)__

### Project
__Only branches off of dev__ 

__Within the branch__ people SHOULD:

- Push OFTEN, even if it is not done (every GOOD change, “working not done”)
- __PROJECT->DEV__ Once a milestone is met, push into dev, then continue working on the branch
- Work toward ONE milestone at a time, chronologically

__Merging Procedures__

- Once a project pushes ANY milestone into dev, it is the other people’s job working on other projects to sync with dev
- __FIRST PUSH WINS__

__Naming Standards__

- Branch:
> {project name}_{project leader}
- Pushes to a branch:
> {person}_{datetime}
- Pushes to dev:
> {project name}_{milestone name}

### Deleting Branches
__RESPONSIBILITY OF SOFT LEAD + DEPT COORD__

## Github Submodule Guide
### What is a Submodule?
<p> A Git Submodule is a specific folder or address within a repository or project that directs the contents of another respository into the specified file location. 
Submodules are overlooked by the Git machine unless the submodule is entered. When looking at changes through Github Desktop, changes made inside the module will not be detected and must be handled through the console.<p>

<p>The main component behind a Git Submodule is the `.gitmodules` file that can either be auto-generated or manually created. 
The contents of this file provides the necessary information for Submodule setup in the project, but further steps are required to setup code usage.<p>

The contents of the `.gitmodules`:
```
[submodule "libs/3128-common"]
	path = libs/3128-common
	url = https://github.com/Team3128/3128-common.git
```
<br>

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

<br> Call `git help -a` to read all git commands.


### 10 Step Commit Process

1. `./gradlew build`		Build gradle project for compile time errors
2. `git pull`		Fetch from and integrate with origin
3. `git branch -a`		View all local and remote branches
4. `git checkout <BRANCH NAME>`			Switch branches with working tree files
5. `git staus`		Show the working tree staus
6. `git add --all`		Stage all untracked files
7. `git status`		Show the working tree status with all untracked files
8. `git branch`		Double check current branch
9. `git commit -m <COMMIT MESSAGE>`		Commit staged changes to current local branch
10. `git push`		Push commit changes from local to origin

### RUNNING THE AUTO BASH SETUP
__Download and put the submod_setup.sh file into your repository. Then run the following cmds. THIS ALLOWS YOU TO SKIP THE MANUAL SETUP PROCESS.__

```
chmod +x submod_setup.sh
./submod_setup.sh submodule

```
____________________________________________________________________________________________________________________
# Core

## Controller



## FSMSubsystemBase.java

### Preamble
This documentation explains how the FSMSubsystemBase code works. To access this section of the code, access the fsm folder under the common repository.

Authors: Timothy Dimmock (Timmy), Avani Goyal, Rishi Kumar
### Overview
The FSM, or finite-state machine, is defined by a list of states. When we create subsystems, we use the base code to define all of our constants. We then extend our subsystems from this base. All of the FSM subsystems come with a transition map, and most with a defaultTransitioner Function. The FSMSubsystemBase is an abstract Java class designed for managing the states of a subsystem. 
#### Logging and Debugging
- Log.debug() is used for detailed logging
- log.recoverable() handles warnings (e.g., null states)
- log.unusual() records invalid transitions
### States and Transitions
- currentState: current states of the FSM
- previousState: last state before transitioning
- currentTransition: the active transition (if any)
- requestTransition: requested transition
- transitionMap: stores valid transitions
### Constructor
- Initializes enum class and transitionMap
- begins tracking state data (initStateTracker() integrates with shuffleboard to displace useful FSM data).
- registers transitions
### Managing States and Transitions
- setState(S nextState) handles state transitions. It gets the transition between the current state and the requested state.
- setStateCommand(S nextState)  returns a command that sets the states when it's executed.
- stateEquals(S otherState) returns true if the current state matches other state and there is no transition occuring.
- isTransitioning() returns true if a transition is in progress.
- addTransition() adds a new transition between two states to the transition map.
- registerTransitions() is an abstract method that must be implemented in subclasses to define valid state transitions.
### Managing Subsystems
- addSubsystem() adds subsystems to the FSM for coordinated control.
- reset() stops the FSM and resets all associated subsystems.
- getSubsystems() and getSubsystem(String name) retrieve all added subsystems or a specific one by name.
- setNeutralMode() sets the neutral mode of the motors for all associated subsystems.
### Running Commands
- run(double power) runs all subsystems at a specified power level and logs the action.
- runVolts(double volts) runs all subsystems at a specified voltage and logs the action.
- stop() cancels any active transition and stops all subsystems.
____________________________________________________________________________________________________________________

## Transition.java

### Preamble
This documentation explains how the FSM transition file works.

Authors: Timothy Dimmock (Timmy), Avani Goyal
### Overview
The Transition class facilitates state transitions in an FSM by defining outgoing and incoming states along with an optional command. It provides methods to check, execute, cancel and compare transitions.
- outgoingState: state the robot is transitioning from
- incomingSate: the state the subsystems are transitioning from.
- command: a command that executes when the transition occurs.
### Constructor Variants
There's three ways to construct a transition, all of which record the incoming and outgoing states. 
- Transition ( T outgoingState, T incomingState, Command command) creates a transition with a specific command executed during the transition.
- Transition ( T outgoingState, T incomingState, Runnable action) creates a transition with a runnable (skips the step of creating a command) which is then converted into a command
- Transition ( T outgoingState, T incomingState) creates a transition without any associated command.
### Get Methods
Methods that retrieve information about the transition, like the outgoing and incoming states, and the associated commands.
### Transition Validation
- isTransition(T currentState, T nextState) checks if the transition that is trying to be run is the given transition.
- equals(Transition<T> other) checks if two transitions are identical
### Utility Methods
- toString() returns a string representation of the transition
- cancel() cancels the transition command.
- execute() schedules the command for execution.
- isScheduled() checks if the command is currently scheduled.
- isFinished() checks if the command has finished executing.
____________________________________________________________________________________________________________________

## TransitionMap
### Overview
TransitionMap is a class designed to define transitions from one state to another. 
It provides an easy way to create methods that are excecuted when a transition occurs.
## 

## Subsystem Templates

## Swerve

# Hardware:

## Cameras
## Input
## Limelight
## Motor Controllers

# Utility:

## Narwhal Dashboard
## Shuffleboard
## SysID