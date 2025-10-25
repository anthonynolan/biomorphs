import numpy as np


class Grid:

    def __init__(self, width=0, height=0, grid=None):
        """Create a Grid.

        - If `grid` is provided (nested list or numpy array), infer size from it.
        - Otherwise, create an empty grid of shape [width, height].
        """
        if grid is not None:
            arr = np.asarray(grid)
            if arr.ndim != 2:
                raise ValueError("grid must be a 2D array or list of lists")
            self.grid = arr.astype(int)
            # Note: we store shape as (width, height) consistent with prior code
            self.width, self.height = self.grid.shape
        else:
            self.width = width
            self.height = height
            self.grid = np.zeros([width, height], dtype=int)

    def randomise(self):
        for x in range(self.width):
            for y in range(self.height):
                self.grid[x, y] = 1 if (np.random.uniform() > .8) else 0

    def get_adjacent_orthogonal(self, row, col):
        rows, cols = self.grid.shape
        directions = [(-1,0), (1,0), (0,-1), (0,1)]
        neighbors = []
        
        for dr, dc in directions:
            r, c = row + dr, col + dc
            if 0 <= r < rows and 0 <= c < cols:
                neighbors.append(self.grid[r, c])
                
        return np.array(neighbors)

    def mutate(self):
        for x in range(self.width):
            for y in range(self.height):
                # get the neighbours
                neighbours = self.get_adjacent_orthogonal(y, x)

                if neighbours.sum()<=1:
                    self.grid[x,y] = 0
                elif neighbours.sum()>1 and neighbours.sum()<=3 :
                    self.grid[x,y] = 1
                elif neighbours.sum()>=4 :
                    self.grid[x,y] = 0
                elif neighbours.sum()==3 :
                    self.grid[x, y] = 1

                    
                

    def as_list(self):
        return self.grid.tolist()

    @classmethod
    def from_list(cls, data):
        """Create a Grid from a 2D list/array.

        Accepts a nested Python list (list of lists) or a 2D numpy array
        representing the cells. Values are coerced to integers.
        """
        arr = np.asarray(data)
        if arr.ndim != 2:
            raise ValueError("from_list expects a 2D list or array")
        return cls(grid=arr)
