import * as React from "react";
import styled from "styled-components";
import { useTable, Column } from "react-table";
import { Game } from "@xgp/types";
import { Layout, Header, Footer } from "..";

const Table = styled.table`
  border-collapse: collapse;
`;
const Cell = styled.td`
  text-align: left;
  padding: 0.5rem 0.25rem;
  border-bottom: 1px solid #232f3c;

  &:nth-child(1) {
    width: 50%;
  }
  &:nth-child(2) {
    width: 20%;
  }
  &:nth-child(3) {
    width: 30%;
  }
`;
const CellHeader = styled(Cell).attrs({ as: "th" })`
  font-weight: bold;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
`;
const InlineList = styled.ul`
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
`;
const InlineListItem = styled.li`
  &:not(:last-child) {
    margin-right: 0.25rem;

    &::after {
      content: ",";
    }
  }
`;

const COLUMNS: Array<Column<Game>> = [
  {
    id: "name",
    Header: "Name",
    accessor: (game) => game.name,
  },
  {
    id: "platforms",
    Header: "Platforms",
    accessor: (game) =>
      [game.availability.console && "Console", game.availability.pc && "PC"]
        .filter(Boolean)
        .join(", "),
    Cell: ({ row }) => {
      const game: Game = row.original;
      return (
        <InlineList>
          {game.availability.console && (
            <InlineListItem>
              <a href={game.availability.console} className="Link">
                Console
              </a>
            </InlineListItem>
          )}
          {game.availability.pc && (
            <InlineListItem>
              <a href={game.availability.pc} className="Link">
                PC
              </a>
            </InlineListItem>
          )}
        </InlineList>
      );
    },
  },
  {
    id: "steam",
    Header: "Steam",
    accessor: (game) => game.steam?.reviews?.reviewScoreDesc ?? "",
    Cell: ({ row, value }) => {
      const game: Game = row.original;
      return (
        <>
          {game.steam?.reviews ? (
            <a
              href={`https://store.steampowered.com/app/${game.steam.appid}/`}
              className="Link"
            >
              {value}
            </a>
          ) : (
            value
          )}
        </>
      );
    },
  },
];

export function Games() {
  const [games, setGames] = React.useState<Array<Game>>([]);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns: COLUMNS, data: games });

  React.useEffect(() => {
    const controller = new AbortController();

    fetch("/games.json", { signal: controller.signal })
      .then((res) => res.json())
      .then((games) => setGames(games));

    return controller.abort;
  }, []);

  return (
    <Layout>
      <Header />
      <main className="Container Main">
        <Table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <CellHeader {...column.getHeaderProps()}>
                    {column.render("Header")}
                  </CellHeader>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <Cell {...cell.getCellProps()}>
                        {cell.render("Cell")}
                      </Cell>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </main>
      <Footer />
    </Layout>
  );
}
