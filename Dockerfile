FROM ubuntu:latest

ENV PATH="/root/miniconda3/bin:${PATH}"
ARG PATH="/root/miniconda3/bin:${PATH}"

ADD . /root/home/

RUN apt update \
    && apt install -y make wget
'''
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y git
'''

RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh \
    && mkdir root/.conda \
    && sh Miniconda3-latest-Linux-x86_64.sh -b \
    && rm -f Miniconda3-latest-Linux-x86_64.sh

RUN /bin/bash -c "cd home \
#    && git clone https://github.com/hackforla/lucky-parking.git \
#    && cd lucky-parking \
#    && git checkout citation-analysis \
    && make create_environment \ 
    && conda init bash \
    && exec bash"
