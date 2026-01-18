import { useIsFetching } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

export const Loader = () => {
	const isFetching = useIsFetching();

	if (!isFetching) return null;

	return <LoaderCircle className="animate-spin" />;
};
