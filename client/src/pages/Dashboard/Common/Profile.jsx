import useAuth from "../../../hooks/useAuth";
import { Helmet } from "react-helmet-async";
import coverImg from "../../../assets/images/cover.jpg";
import useRole from "../../../hooks/useRole";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
const Profile = () => {
  const { user, loading } = useAuth();
  const { role, isLoading } = useRole();

  if ((loading, isLoading)) return <LoadingSpinner></LoadingSpinner>;
  // console.log(role);
  return (
    <div className="flex justify-center items-center h-screen">
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <div className="bg-white shadow-lg md:w-4/5 lg:w-3/5">
        <img alt="cover photo" src={coverImg} className="w-full mb-4 h-56" />
        <div className="flex flex-col items-center justify-center p-4 -mt-16">
          <a href="#" className="relative block">
            <img
              alt="profile"
              src={user.photoURL}
              className="mx-auto object-cover rounded-full h-24 w-24  border-2 border-white"
            />
          </a>

          <p className="p-2 px-4 mt-3 mb-2 text-xs text-white bg-lime-500 rounded">
            {role}
          </p>
          <p className="mt-2 text-xl font-medium text-gray-800 ">
            User Id: <span className="font-normal">{user.uid}</span>
          </p>
          <div className="w-full p-2 mt-4 rounded-lg">
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 ">
              <p className="flex flex-col">
                Name
                <span className="font-bold text-black ">
                  {user.displayName}
                </span>
              </p>
              <p className="flex flex-col">
                Email
                <span className="font-bold text-black ">{user.email}</span>
              </p>

              <div>
                <button className="bg-lime-500 hover:text-white px-10 py-1 rounded text-gray-800 cursor-pointer hover:bg-lime-800 block mb-1">
                  Update Profile
                </button>
                <button className="bg-lime-500 px-7 py-1 rounded hover:text-white text-gray-800 cursor-pointer hover:bg-lime-800">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
