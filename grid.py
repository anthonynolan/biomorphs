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
                self.grid[x, y] = 1 if (np.random.uniform() > .5) else 0

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
