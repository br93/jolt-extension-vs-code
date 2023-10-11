# JOLT extension for VS Code

![JOLT extension for VS Code ](https://raw.githubusercontent.com/br93/jolt-extension-vs-code/main/documentation/example.png)

## Commands

- JOLT (Create input/spec)
- JOLT (Transform)
- JSLT (Create jslt/json)
- JSLT (Transform)

### JOLT

- Open Command Pallete, type "JOLT (Create input/spec)" to create input and spec

- Edit input (example format):
```
    {
      "rating": {
        "primary": {
          "value": 
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

### JSLT

- Open Command Pallete, type "JSLT (Create jslt/json)" to create jslt and json

- Edit jslt (example format):
```
    let idparts = split(.id, "-")
    let xxx = [for ($idparts) "x" * size(.)]

    {
      "id" : join($xxx, "-"),
      "type" : "Anonymized-View",
      * : .
    }

```
- Edit json (example format)
```
    {
      "schema" : "http://schemas.schibsted.io/thing/pulse-simple.json#1.json",
      "id" : "w23q7ca1-8729-24923-922b-1c0517ddffjf1",
      "published" : "2017-05-04T09:13:29+02:00",
      "type" : "View",
      "environmentId" : "urn:schibsted.com:environment:uuid",
      "url" : "http://www.aftenposten.no/"
    }
```
- Open Command Pallete, type "JSLT (Transform)" and transform your payload