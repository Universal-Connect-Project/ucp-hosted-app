import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import ConnectWidget from "./ConnectWidget";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";
import WidgetConfiguration from "./WidgetConfiguration";
import {
  INSTITUTION_SELECTED,
  MEMBER_CONNECTED,
  FormValues,
  checkboxes,
} from "./constants";
import { useAppDispatch } from "../shared/utils/redux";
import { addConnection, Connection } from "../shared/reducers/demo";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";

interface IframeMessage {
  type: string;
  metadata?: {
    name?: string;
    [key: string]: unknown;
  };
}

const Connect: React.FC = () => {
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(
    null,
  );
  const [institutionName, setInstitutionName] = useState("");
  const [isConnectionSuccess, setIsConnectionSuccess] = useState(false);
  const dispatch = useAppDispatch();

  const defaultValues = checkboxes.reduce(
    (acc, { name }) => ({
      ...acc,
      [name]: false,
    }),
    {
      aggregator: "",
    },
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    trigger,
    reset,
  } = useForm<FormValues>({
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setSubmittedValues(data);
  };

  const handleReset = () => {
    reset(defaultValues);
    setSubmittedValues(null);
  };

  // POST MESSAGE HANDLER

  useEffect(() => {
    const handleMessage = (event: MessageEvent<IframeMessage>) => {
      if (event.origin !== WIDGET_DEMO_BASE_URL) {
        return;
      }

      const { type, metadata } = event.data;
      if (type === INSTITUTION_SELECTED) {
        setInstitutionName(metadata?.name as string);
      }

      if (type === MEMBER_CONNECTED) {
        setIsConnectionSuccess(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setIsConnectionSuccess, setInstitutionName]);

  useEffect(() => {
    const jobTypeDisplayNames = Object.entries(submittedValues || {})
      .filter(([key, value]) => key !== "aggregator" && value)
      .map(([key]) => supportsJobTypeMap[key as keyof FormValues].displayName);

    if (isConnectionSuccess) {
      const newConnection: Connection = {
        aggregator: submittedValues?.aggregator as string,
        jobTypes: jobTypeDisplayNames,
        institution: institutionName,
      };
      dispatch(addConnection(newConnection));
      setIsConnectionSuccess(false);
    }
  }, [isConnectionSuccess, institutionName, dispatch, submittedValues]);

  if (submittedValues) {
    return (
      <ConnectWidget
        jobTypes={Object.entries(submittedValues)
          .filter(([key, value]) => key !== "aggregator" && value)
          .map(([key]) => key)}
        aggregator={submittedValues.aggregator}
        onReset={handleReset}
      />
    );
  }

  return (
    <WidgetConfiguration
      control={control}
      errors={errors}
      trigger={trigger}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
};

export default Connect;
