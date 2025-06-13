import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import Button from "../Shared/Button/Button";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const PurchaseModal = ({ closeModal, isOpen, plant, refetch }) => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { name, category, price, quantity, _id, seller } = plant;

  const [totalQuantity, setTotalQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(price);
  const [address, setAddress] = useState("");

  // Quantity Change Handler
  const handleQuantityChange = (value) => {
    const intValue = parseInt(value, 10);
    if (intValue > quantity) {
      setTotalQuantity(quantity);
      return toast.error(
        `You cannot select more than available quantity (${quantity}).`
      );
    }
    if (intValue <= 0 || isNaN(intValue)) {
      setTotalQuantity(1);
      return toast.error("Quantity cannot be less than 1.");
    }

    setTotalQuantity(intValue);
    setTotalPrice(intValue * price);
    toast.success(`You have selected ${intValue} items.`);
  };

  // Purchase Handler
  const handlePurchase = async () => {
    const orderData = {
      customer: {
        name: user?.displayName,
        email: user?.email,
        photoURL: user?.photoURL,
      },
      plantId: _id,
      name: name,
      quantity: totalQuantity,
      price: totalPrice,
      seller: seller?.email,
      address: address,
      status: "pending",
    };

    try {
      await axiosSecure.post("/order", orderData);
      await axiosSecure.patch(`/plant/quantity/${_id}`, {
        quantityToUpdate: totalQuantity,
        status: "decrease",
      });
      refetch();
      navigate("/dashboard/my-orders");
      toast.success("Purchase Successful!");
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      closeModal();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium text-center leading-6 text-gray-900"
                >
                  Review Info Before Purchase
                </DialogTitle>

                <div className="mt-2">
                  <p className="text-sm text-gray-500">Plant: {name}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Category: {category}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Customer: {user?.displayName}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Price: $ {price}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Available Quantity: {quantity}
                  </p>
                </div>

                {/* Quantity Input */}
                <div className="space-y-1 items-center text-sm flex mt-1 gap-2">
                  <label htmlFor="quantity" className="block text-gray-600">
                    Quantity
                  </label>
                  <input
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-56 px-2 py-1 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded bg-white"
                    name="quantity"
                    value={totalQuantity}
                    id="quantity"
                    type="number"
                    placeholder="Select quantity"
                    required
                  />
                </div>

                {/* Address Input */}
                <div className="space-y-1 items-center text-sm flex mt-1 gap-2">
                  <label htmlFor="address" className="block text-gray-600">
                    Address:
                  </label>
                  <input
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-56 px-2 py-1 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded bg-white"
                    name="shipment"
                    id="address"
                    type="text"
                    placeholder="Shipment Address..."
                    required
                  />
                </div>

                {/* Purchase Button */}
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={handlePurchase}
                    label={`Pay ${totalPrice} $`}
                  ></Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

PurchaseModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  plant: PropTypes.object.isRequired,
  refetch: PropTypes.func.isRequired,
};

export default PurchaseModal;
