FROM ubuntu:latest

ENV PATH="root/miniconda3/bin:${PATH}"
ARG PATH="root/miniconda3/bin:${PATH}"

RUN mkdir -p /root/home/lucky-parking

ADD . /root/home/lucky-parking

RUN apt update \
    && apt install -y make wget
    
RUN apt-get -y update

RUN apt-get -y install git

RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh \
    && mkdir root/.conda \
    && sh Miniconda3-latest-Linux-x86_64.sh -b \
    && rm -f Miniconda3-latest-Linux-x86_64.sh

WORKDIR /root/home/lucky-parking

RUN /bin/bash -c "pip install requirements.txt \ 
    && conda init bash \
    && exec bash"
