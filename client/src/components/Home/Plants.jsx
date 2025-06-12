import Card from "./Card";
import Container from "../Shared/Container";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../Shared/LoadingSpinner";
import axios from "axios";

const Plants = () => {
  // This component is responsible for displaying a grid of plant cards.
  const { data: plants, isLoading } = useQuery({
    queryKey: ["plants"],
    queryFn: async () => {
      const { data } = await axios(`${import.meta.env.VITE_API_URL}/plants`);
      // console.log("Plants data fetched:", data);
      return data;
    },
  });

  if (isLoading) <LoadingSpinner></LoadingSpinner>;

  // console.log("Plants data:", plants);

  return (
    <Container>
      {plants && plants.length > 0 ? (
        <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {plants.map((plant) => (
            <Card key={plant._id} plant={plant} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No plants available</div>
      )}
    </Container>
  );
};

export default Plants;
