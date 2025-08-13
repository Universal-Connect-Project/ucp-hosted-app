import React, { useState } from "react";
import { TablePagination } from "./TablePagination";
import { render, screen, userEvent } from "../../test/testUtils";

const TestComponent = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <TablePagination
      totalRecords={100}
      page={currentPage}
      pages={10}
      pageSize={rowsPerPage}
      handleChangePageSize={(event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
      }}
      handleChangePage={(event, newPage) => {
        setCurrentPage(newPage);
      }}
    />
  );
};

describe("<TablePagination />", () => {
  it("allows changing rows per page", async () => {
    render(<TestComponent />);

    expect(await screen.findByText("1–10 of 100")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("combobox", { name: "Rows per page:" }),
    );

    await userEvent.click(screen.getByRole("option", { name: "50" }));

    expect(await screen.findByText("1–50 of 100")).toBeInTheDocument();
  });

  it("allows changing page", async () => {
    render(<TestComponent />);

    expect(await screen.findByText("1–10 of 100")).toBeInTheDocument();

    await userEvent.click(screen.getByText("2"));

    expect(await screen.findByText("11–20 of 100")).toBeInTheDocument();
  });
});
