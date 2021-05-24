lucky-parking-analysis
==============================

Hack for LA analysis of parking citation data



#### To create an AWS EC2 instance to run this repo, follow the steps documented in the references folder: 
[Link to screenshots](references/awsEC2.pdf)

```
# Once you have setup your AWS instance, make sure you run 
chmod 400 your_pem_file.pem

# Move your pem file to your .ssh folder
mv your_pem_file.pem ~/.ssh

# Open a terminal and SSH into your instance
ssh -i ~/.ssh/your_pem_file.pem ubuntu@your_aws_host_name_here
```

#### Running it locally:
It is suggested that you work on a fork of the code. Use the fork button on the repo page to create your own copy.
``` 
# Update
sudo apt upgrade

# Git clone your fork
git clone https://github.com/(your Git username here)/lucky-parking.git
cd lucky-parking

# Change branch
git checkout citation-analysis

# Install make and conda
sudo apt install make
cd ..
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh

# Type yes to initialize conda
# Restart shell
exec bash

# Conda should now be available
# Remove installer (optional)
rm Miniconda3-latest-Linux-x86_64.sh

# Create environment and activate
cd lucky-parking
make create_environment
conda activate lucky-parking-analysis

# Make data!
make data

```
If using VSCode, use Remote-SSH extension as your development environment:
[Remote-SSH Tutorial](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)

#### Using the Makefile to create data:
If you're using a Mac, you might have to install some certificates first
https://stackoverflow.com/questions/52805115/certificate-verify-failed-unable-to-get-local-issuer-certificate
```
# Create your conda environment
make create_environment

# Activate the lucky-parking-analysis environment
conda activate lucky-parking-analysis

# Download to data/raw
# Raw data is sampled and saved to data/interim (10% default)
# Sample data is cleaned to data/processed
make data

```
To create a smaller or larger sample from full dataset use: make sample frac={your fraction here} clean=False
Use make sample frac={your fraction here} clean=True, for cleaned csv dataset that ends up in processed
For 15% csv sample that is cleaned: make sample frac=0.15 clean=True

#### Uploading your changes to your fork
If you haven't already, create a fork of the repo--this is your version of our code from which you will do pull requests from. 
Make sure that you have 2-factor authentication activated. 
Create a personal token by clicking on your avatar the top right corner and then going to -> Settings -> Developer settings -> Personal access tokens and create a new token with the appropriate permissions. Copy this resulting token.
Use the credential store to locally store your password `git config credential.helper cache`
Make changes to your code, add them `git add .`, commit it `git commit -m 'your comment here'`, and push your changes to your fork `git push origin citation-analysis`. 
Enter your username and the token string as your password. Now you can upload changes to your repo using the command line.

Project Organization
------------

    ├── LICENSE
    ├── Makefile           <- Makefile with commands like `make data` or `make train`
    ├── README.md          <- The top-level README for developers using this project.
    ├── data
    │   ├── external       <- Data from third party sources.
    │   ├── interim        <- Intermediate data that has been transformed.
    │   ├── processed      <- The final, canonical data sets for modeling.
    │   └── raw            <- The original, immutable data dump.
    │
    ├── docs               <- A default Sphinx project; see sphinx-doc.org for details
    │
    ├── models             <- Trained and serialized models, model predictions, or model summaries
    │
    ├── notebooks          <- Jupyter notebooks. Naming convention is a number (for ordering),
    │                         the creator's initials, and a short `-` delimited description, e.g.
    │                         `1.0-jqp-initial-data-exploration`.
    │
    ├── references         <- Data dictionaries, manuals, and all other explanatory materials.
    │
    ├── reports            <- Generated analysis as HTML, PDF, LaTeX, etc.
    │   └── figures        <- Generated graphics and figures to be used in reporting
    │
    ├── requirements.txt   <- The requirements file for reproducing the analysis environment, e.g.
    │                         generated with `pip freeze > requirements.txt`
    │
    ├── setup.py           <- makes project pip installable (pip install -e .) so src can be imported
    ├── src                <- Source code for use in this project.
    │   ├── __init__.py    <- Makes src a Python module
    │   │
    │   ├── data           <- Scripts to download or generate data
    │   │   └── make_dataset.py
    │   │
    │   ├── features       <- Scripts to turn raw data into features for modeling
    │   │   └── build_features.py
    │   │
    │   ├── models         <- Scripts to train models and then use trained models to make
    │   │   │                 predictions
    │   │   ├── predict_model.py
    │   │   └── train_model.py
    │   │
    │   └── visualization  <- Scripts to create exploratory and results oriented visualizations
    │       └── visualize.py
    │
    └── tox.ini            <- tox file with settings for running tox; see tox.readthedocs.io
    
--------

<p><small>Project based on the <a target="_blank" href="https://drivendata.github.io/cookiecutter-data-science/">cookiecutter data science project template</a>. #cookiecutterdatascience</small></p>



