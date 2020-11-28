all:
	@echo "Options: make data--download whole dataset to data folder or make clean--clear dataset from data folder"
	
data:
	@echo "Downloading whole dataset to data folder"
	wget -O ./data/`date +%Y-%m-%d`_full.csv https://data.lacity.org/api/views/wjz9-h9np/rows.csv?accessType=DOWNLOAD

clean:
	@echo "Clearing dataset in data folder"
	rm ./data/*_full.csv

