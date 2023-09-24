# JOLT extension for VS Code

This is a JOLT extension for VS Code. Create a "input.json" and "spec.json" file in root of workspace/project, run the extension and check the results.

## Running the Extension

- Create a "input.json" in root of workspace/project.
```
{
  "rating": {
    "primary": {
      "value": 3
    },
    "quality": {
      "value": 3
    }
  }
}

```

- Create a "spec.json" in root of workspace/project.
```
[
  {
    "operation": "shift",
    "spec": {
      "rating": {
        "primary": {
          "value": "Rating",
          "max": "RatingRange"
        },
        "*": {
          "max": "SecondaryRatings.&1.Range",
          "value": "SecondaryRatings.&1.Value",
          "$": "SecondaryRatings.&1.Id"
        }
      }
    }
  },
  {
    "operation": "default",
    "spec": {
      "Range": 5,
      "SecondaryRatings": {
        "*": {
          "Range": 5
        }
      }
    }
  }
]

```
- Open Command Pallete, type "JOLT" and run the extension	
