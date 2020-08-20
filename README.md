# Lucky-parking Project

- A Hack for LA project helping the city planners and the community make informed decisions about the effects of parking policies in the City of Los Angeles.

![logo](logo/Lucky_parking7.png)
## Project Context

- Please review <a href="https://drive.google.com/open?id=1-7G2inkbz4o14AHIX1VQjmz-QUESYlhg">LUCKY PARKING_ONBOARDING READ-ME.docx</a> for quick on-board.

- Please review <a href="https://drive.google.com/open?id=1gnEUpcPIu8AX5bw1kPIZdubwcDDtsI-y">LA Street Curb Parking Citation Study & Prediction.docx</a> for project scope of work.

## Technical Prerequisite
- Have Jupyter Notebook or Google Colab installed on your computer.

- Have GitHub account and joined hackforla on GitHub.

- Go over <a href="https://drive.google.com/open?id=1tu7YlY5sZEVqQPSXqP6LuJs07us314Bokzw9uHbFGdc">GitHub "Branch" workflow</a> created by team member. 

- Go over <a href="https://drive.google.com/open?id=1Ss07p5bcrYb3LKrww-mLHbCCVKg_DT6V4tswq345ndY">GitHub "Fork" Workflow</a> created by team member. 

## Setup

We will need Python 3.x and pip, the Python Package Installer to run the code in this project.

#### Install Python Windows

See directions for installing Python on Windows. https://docs.python.org/3.7/using/windows.html

#### Install Mac

Use Homebrew to install Python on Mac.

#### Install Dependencies

Once you have Python 3 installed, create a new virtual environment to hold your dependencies and activate it:

```
python3 -m venv ~/.virtualenvs/lucky-parking
source ~/.virtualenvs/lucky-parking/bin/activate
```

Once the virtual environment is active, navigate to the project folder and install the project dependencies:
```
pip install -r requirements.txt
```

#### Data Fetch

- For full entry of citation data from 2015 to 2019. Click <a href="https://drive.google.com/open?id=1c4c4m8dW1oHiPS3iXF9CT-C5akz6SA2p">Here</a> to download.

- For simplified citation data and other related datasets, clone the repo and find them in "data" folder

- For fetching data directly from city API, please go to https://dev.socrata.com/foundry/data.lacity.org/wjz9-h9np
