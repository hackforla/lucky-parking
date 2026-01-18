export const DataAbout = () => {
	return (
		<>
			<p>
				<span className="font-semibold">Parking Insights</span> helps you explore where and when parking citations are
				issued across the City of Los Angeles.
			</p>

			<p>
				<span className="font-semibold">
					<a
						href="https://data.lacity.org/Transportation/Parking-Citations/4f5p-udkv/about_data"
						rel="noopener noreferrer"
						target="_blank">
						LA Parking Citations
					</a>
				</span>{" "}
				contains records of parking tickets issued across the City of Los Angeles. It reflects where and when parking
				violations occur, offering insight into parking enforcement activity and common citation patterns throughout the
				city.
			</p>
		</>
	);
};
