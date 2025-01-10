import React, { useState } from 'react';
import { View, Button, TextInput, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';

const createEmptyBoard = () => Array.from({ length: 9 }, () => Array(9).fill(0));

const createPrefilledBoard = () => {
  const board = createEmptyBoard();

  const isValidPlacement = (board, row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i][startCol + j] === num) return false;
      }
    }

    return true;
  };

  const fillRandomCells = (board, count) => {
    let filled = 0;
    while (filled < count) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      const num = Math.floor(Math.random() * 9) + 1;

      if (board[row][col] === 0 && isValidPlacement(board, row, col, num)) {
        board[row][col] = num;
        filled++;
      }
    }
  };

  fillRandomCells(board, Math.floor(Math.random() * 6) + 15);

  return board;
};

const isValidSudoku = (board) => {
  const isValidGroup = (group) => {
    const filtered = group.filter((num) => num !== 0);
    return new Set(filtered).size === filtered.length;
  };

  for (let i = 0; i < 9; i++) {
    const row = board[i];
    const column = board.map((row) => row[i]);
    if (!isValidGroup(row) || !isValidGroup(column)) return false;
  }

  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const box = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          box.push(board[boxRow * 3 + i][boxCol * 3 + j]);
        }
      }
      if (!isValidGroup(box)) return false;
    }
  }

  return true;
};

const solveSudoku = (board) => {
  const findEmptyCell = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) return [row, col];
      }
    }
    return null;
  };

  const isValidPlacement = (row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i][startCol + j] === num) return false;
      }
    }

    return true;
  };

  const backtrack = () => {
    const emptyCell = findEmptyCell();
    if (!emptyCell) return true;

    const [row, col] = emptyCell;
    for (let num = 1; num <= 9; num++) {
      if (isValidPlacement(row, col, num)) {
        board[row][col] = num;
        if (backtrack()) return true;
        board[row][col] = 0;
      }
    }
    return false;
  };

  return backtrack();
};

const SudokuSolver = () => {
  const [board, setBoard] = useState(createPrefilledBoard());
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (value, row, col) => {
    if (value === '' || /^[1-9]$/.test(value)) {
      const newBoard = board.map((r, rowIndex) =>
        r.map((cell, colIndex) =>
          rowIndex === row && colIndex === col ? (value ? +value : 0) : cell
        )
      );
      setBoard(newBoard);
      setErrorMessage('');
    }
  };

  const validateBoard = () => {
    if (!isValidSudoku(board)) {
      setErrorMessage('Invalid Sudoku setup. Please check your inputs.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleSolve = () => {
    if (!validateBoard()) return;

    const boardCopy = board.map((row) => [...row]);
    if (solveSudoku(boardCopy)) {
      setBoard(boardCopy);
      setErrorMessage('');
    } else {
      setErrorMessage('Sudoku puzzle is unsolvable.');
    }
  };

  const handleHint = () => {
    if (!validateBoard()) return;

    const boardCopy = board.map((row) => [...row]);
    if (solveSudoku(boardCopy)) {
      const emptyCells = [];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) emptyCells.push([row, col]);
        }
      }

      if (emptyCells.length > 0) {
        const [hintRow, hintCol] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const hintValue = boardCopy[hintRow][hintCol];
        const newBoard = board.map((r, rowIndex) =>
          r.map((cell, colIndex) =>
            rowIndex === hintRow && colIndex === hintCol ? hintValue : cell
          )
        );
        setBoard(newBoard);
      }
    } else {
      setErrorMessage('Cannot provide a hint for an unsolvable puzzle.');
    }
  };

  const handleReset = () => {
    setBoard(createPrefilledBoard());
    setErrorMessage('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>SudokuSolver</Text>
      <View>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <TextInput
                key={colIndex}
                style={styles.cell}
                value={cell !== 0 ? String(cell) : ''}
                onChangeText={(value) => handleInputChange(value, rowIndex, colIndex)}
                keyboardType="numeric"
                maxLength={1}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={validateBoard} style={styles.button}>
          <Text style={{ color: 'white' }}>Validate</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSolve} style={styles.button}>
          <Text style={{ color: 'white' }}>Solve</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleHint} style={styles.button}>
          <Text style={{ color: 'white' }}>Hint</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReset} style={styles.button}>
          <Text style={{ color: 'white' }}>Reset</Text>
        </TouchableOpacity>
      </View>
      {errorMessage !== '' && <Text style={styles.errorText}>{errorMessage}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
    borderColor: 'black',
    width: 35,
    height: 35,
    textAlign: 'center',
    fontSize: 18,
    margin: 1,
    backgroundColor: '#E8F0FE',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 10,
  },
  button: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 5,
    backgroundColor: '#550000',
    borderRadius: 5,
    alignSelf: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SudokuSolver;
