# ubuntu base image
# exact version is ubuntu@sha256:703218c0465075f4425e58fac086e09e1de5c340b12976ab9eb8ad26615c3715
FROM ubuntu:20.04

# environment variables
ENV PATH="/root/miniconda3/bin:${PATH}"
ENV CONDA_VERSION="4.9.2"

# linux dependencies
RUN apt-get update && \
    apt-get install -y wget curl sudo vim \
    && rm -rf /var/lib/apt/lists/*

# install conda
RUN wget \
    https://repo.anaconda.com/miniconda/Miniconda3-py38_${CONDA_VERSION}-Linux-x86_64.sh \
    && mkdir /root/.conda \
    && bash Miniconda3-py38_${CONDA_VERSION}-Linux-x86_64.sh -b \
    && rm -f Miniconda3-py38_${CONDA_VERSION}-Linux-x86_64.sh 

# create conda environment
COPY environment.yml /tmp/
RUN conda env create -f /tmp/environment.yml && \
    rm -rf /tmp/environment.yml

# start jupyter
ENTRYPOINT ["conda", "run", "--no-capture-output", "-n", "luckyparkingenv", "jupyter", "lab", "--allow-root", "--ip=0.0.0.0"]