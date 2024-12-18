import React, { useState } from "react";
import ConfirmationDrawer, {
  useConfirmationDrawer,
  UseMutation,
} from "./ConfirmationDrawer";
import { Button, Drawer } from "@mui/material";
import { useDeleteInstitutionMutation } from "../../../Institutions/ChangeInstitution/api";
import { render, screen, userEvent } from "../../test/testUtils";
import { CONFIRMATION_DRAWER_CLOSE_BUTTON_TEXT } from "./confirmationDrawerConstants";
import { server } from "../../test/testServer";
import { http, HttpResponse } from "msw";
import { INSTITUTION_SERVICE_INSTITUTIONS_URL } from "../../../Institutions/api";
import { TRY_AGAIN_BUTTON_TEXT } from "../constants";

const openDrawerButtonText = "Open Drawer";

const showConfirmationButtonText = "show the confirmation";
const description = "Description";
const errorText = "Error text";
const formId = "formid";
const submitParams = {};
const submitButtonText = "Submit button";
const successMessage = "Success message";
const title = "Title";

const TestComponent = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseDrawer = () => setIsOpen(false);

  const { handleShowConfirmation, shouldShowConfirmation } =
    useConfirmationDrawer({ isOpen });

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{openDrawerButtonText}</Button>
      <Drawer open={isOpen}>
        {shouldShowConfirmation ? (
          <ConfirmationDrawer
            description={description}
            errorText={errorText}
            formId={formId}
            handleCloseDrawer={handleCloseDrawer}
            onSuccess={onSuccess}
            submitButtonText={submitButtonText}
            submitParams={submitParams}
            successMessage={successMessage}
            title={title}
            useMutation={useDeleteInstitutionMutation as unknown as UseMutation}
          />
        ) : (
          <Button onClick={handleShowConfirmation}>
            {showConfirmationButtonText}
          </Button>
        )}
      </Drawer>
    </>
  );
};

describe("<ConfirmationDrawer />", () => {
  it("shows the success message, calls onSuccess, and closes the drawer on success", async () => {
    const onSuccess = jest.fn();

    render(<TestComponent onSuccess={onSuccess} />);

    await userEvent.click(screen.getByText(openDrawerButtonText));

    await userEvent.click(await screen.findByText(showConfirmationButtonText));

    await userEvent.click(await screen.findByText(submitButtonText));

    expect(await screen.findByText(successMessage)).toBeInTheDocument();

    expect(onSuccess).toHaveBeenCalled();
  });

  it("doesnt show confirmation after a drawer is reopened", async () => {
    render(<TestComponent />);

    await userEvent.click(screen.getByText(openDrawerButtonText));

    await userEvent.click(await screen.findByText(showConfirmationButtonText));

    expect(await screen.findByText(description)).toBeInTheDocument();
    expect(
      screen.queryByText(showConfirmationButtonText),
    ).not.toBeInTheDocument();

    await userEvent.click(
      (await screen.findAllByText(CONFIRMATION_DRAWER_CLOSE_BUTTON_TEXT))[0],
    );

    await userEvent.click(screen.getByText(openDrawerButtonText));

    expect(
      await screen.findByText(showConfirmationButtonText),
    ).toBeInTheDocument();
    expect(screen.queryByText(description)).not.toBeInTheDocument();
  });

  it("renders the description and title", async () => {
    render(<TestComponent />);

    await userEvent.click(screen.getByText(openDrawerButtonText));

    await userEvent.click(await screen.findByText(showConfirmationButtonText));

    expect(await screen.findByText(description)).toBeInTheDocument();
    expect(await screen.findByText(title)).toBeInTheDocument();
  });

  it("shows an error message on failure and allows retry", async () => {
    server.use(
      http.delete(
        `${INSTITUTION_SERVICE_INSTITUTIONS_URL}/:institutionId`,
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    render(<TestComponent />);

    await userEvent.click(screen.getByText(openDrawerButtonText));

    await userEvent.click(await screen.findByText(showConfirmationButtonText));

    await userEvent.click(await screen.findByText(submitButtonText));

    expect(await screen.findByText(errorText)).toBeInTheDocument();

    server.use(
      http.delete(
        `${INSTITUTION_SERVICE_INSTITUTIONS_URL}/:institutionId`,
        () => HttpResponse.json({}),
      ),
    );

    await userEvent.click(await screen.findByText(TRY_AGAIN_BUTTON_TEXT));

    expect(await screen.findByText(successMessage)).toBeInTheDocument();
  });
});
