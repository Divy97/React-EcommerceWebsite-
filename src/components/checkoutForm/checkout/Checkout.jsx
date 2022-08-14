import React, { useState, useEffect } from "react";
import {
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
  Divider,
  Button,
  CssBaseline,
} from "@material-ui/core";
import useStyles from "./styles";
import AddressForm from "../AddressForm";
import PaymentForm from "../PaymentForm";

import { commerce } from "../../../lib/commerce";
import { Link, useHistory } from "react-router-dom";

const steps = ["shipping Address", "Payment Details"];

const Checkout = ({
  cart,
  order,
  error,
  handleCaptureCheckout,
  refreshCart,
}) => {
  const classes = useStyles();
  const history = useHistory();

  const [activeStep, setActiveStep] = useState(0);
  const [checkoutToken, setCheckoutToken] = useState(null);
  const [shippingData, setShippingData] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  useEffect(() => {
    const generateToken = async () => {
      try {
        const token = await commerce.checkout.generateToken(cart.id, {
          type: "cart",
        });
        console.log("TOKEN", token);
        setCheckoutToken(token);
      } catch (error) {
        history.pushState("/");
        console.log(error);
      }
    };

    generateToken();
  }, [cart]);

  const nextStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const backStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const next = (data) => {
    setShippingData(data);
    nextStep();
  };

  const timeout = () => {
    setTimeout(() => {
      setIsFinished(true);
    }, 3000);
  };
  let Confirmation = () =>
    order.customer ? (
      <>
        <div>
          <Typography variant="h5">
            Thank You For Your Purchase, {order.customer.firstname}{" "}
            {order.customer.lastname}
          </Typography>
          <Divider className={classes.divider} />
          <Typography variant="subtitle2">
            Order Reference: {order.customer_reference}
          </Typography>
        </div>
        <br />
        <Button variant="outlined" type="button" component={Link} to="/">
          Back To Home
        </Button>
      </>
    ) : isFinished ? (
      <>
        <div>
          <Typography variant="h5">Thank You For Your Purchase</Typography>
          <Divider className={classes.divider} />
        </div>
        <br />
        <Button
          variant="outlined"
          type="button"
          component={Link}
          to="/"
          onClick={refreshCart}
        >
          Back To Home
        </Button>
      </>
    ) : (
      <div className={classes.spinner}>
        <CircularProgress />
      </div>
    );

  // if (error) {
  //   <div>
  //     <Typography variant="h5">Error : {error} </Typography>
  //     <br />
  //     <Button variant="outlined" type="button" component={Link} to="/">
  //       Back To Home
  //     </Button>
  //   </div>
  // }

  const Form = () =>
    activeStep === 0 ? (
      <AddressForm checkoutToken={checkoutToken} next={next} />
    ) : (
      <PaymentForm
        shippingData={shippingData}
        backStep={backStep}
        checkoutToken={checkoutToken}
        handleCaptureCheckout={handleCaptureCheckout}
        nextStep={nextStep}
        timeout={timeout}
        refreshCart={refreshCart}
      />
    );

  return (
    <>
      <CssBaseline />
      <div className={classes.toolbar} />
      <div className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography variant="h4" align="center">
            Checkout
          </Typography>
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map((step) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <Confirmation />
          ) : (
            checkoutToken && <Form />
          )}
        </Paper>
      </div>
    </>
  );
};

export default Checkout;
