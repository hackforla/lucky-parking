import { useQuery } from "@tanstack/react-query";

type PublicConfig = {
	mapboxAccessToken: string;
	socrataAppToken: string;
};

export const usePublicConfig = () => {
	return useQuery({
		queryKey: ["public", "config"],
		queryFn: async (): Promise<PublicConfig> => {
			const response = await fetch("/api/v1/public/config");
			if (!response.ok) throw new Error("Failed to fetch public config");
			return response.json();
		},
		staleTime: Infinity,
	});
};
