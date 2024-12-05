## Week 7

### 2nd Meeting: 12/11/24

### Attendance
6/8 - Frazer, Kasia, Libing, Will, Brendan and Sai <br>
Missing Mayukhi and Lucas

### What happened?
1. Received feedback on activity and use case diagrams
2. Asked for clarification on persona information
3. Confirmed technologies we will be using for the project

##### 1. 
- We were told to make some changes to the use case diagram (e.g change the beginning so that configuring compression parameters is sequentially after selecting the dataset as opposed to in parallel)
- We were told to add a loop to the activity diagram to show that preview compression and adjust parameters is likely to occur multiple times.

##### 2.
- We asked specific details as to who the system will be used by (as shown below)
1. Systems Engineer (primary user)
2. Control Engineer
3. Process Engineer
4. Operator (of the data collection)

##### 3.
- We confirmed we will be using React for the frontend, Azure for the backend, python for rewriting the compression algorithm, and Terraform.


### Next Tasks
- Complete personas and user stories by thursday (using info from industry meeting)

### Questions to consider:
- How do we calculate which set of parameters are most optimal?
- How do we measure how much data was lost?
    - how does music compression do it?
    - mean squared error technique


