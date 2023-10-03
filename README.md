# JOLT extension for VS Code

This is a JOLT extension for VS Code. Edit your input and spec, transform and check the results.

## Running the Extension

- Open Command Pallete, type "JOLT (Create input/spec)" to create input and spec

- Edit input (example format):
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
- Edit spec (example format)
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
- Open Command Pallete, type "JOLT (Transform)" and transform your payload
