import csv
import re

## PAINTING CLASS ##
# This class holds the paintings' metadata.
class Painting:
    def __init__(self, recordNumber, authorData, title, technique, dimensions, medium, nationalSchool, callNumber, frickClassificationHeading, fileName):
        self.recordNumber = recordNumber
        self.authorData = authorData
        self.title = title
        self.technique = technique
        self.dimensions = dimensions
        self.medium = medium
        self.nationalSchool = nationalSchool
        self.callNumber = callNumber
        self.frickClassificationHeading = frickClassificationHeading
        self.fileName = fileName

    def getRecordNumber(self):
        return self.recordNumber

    ## setAuthorName: get author name from CSV entry
    def setAuthorName(self, authorData):
        regExName = r'([a-zA-Z ]*, [a-zA-Z ]*[a-zA-Z. ]* ?[(a-zA-Z )]*|[a-zA-Z]*)'
        name = re.search(regExName, authorData)
        if (name.group(0).find("Anonymous") != -1):
            return "Anonymous"
        else:
            return name.group(0)

    ## setAuthorBirthYear: get author birth year from CSV entry
    def setAuthorBirthYear(self, authorData):
        regExBirthYear = r'([0-9][0-9][0-9][0-9]-|[0-9][0-9][0-9][0-9]\?-)'
        birthYear = re.search(regExBirthYear, authorData)
        if (birthYear == None):
            return "Unknown"
        else:
            return birthYear.group(0).split('-')[0]

    ## setAuthorDeathYear: get author death year from CSV entry
    def setAuthorDeathYear(self, authorData):
        regExDeathYear = r'(-[0-9][0-9][0-9][0-9](.|,)|-[0-9][0-9][0-9][0-9]\?(.|,))'
        deathYear = re.search(regExDeathYear, authorData)
        if (deathYear == None):
            return "Unknown"
        else:
            return re.split('[, .]',deathYear.group(0).split('-')[1])[0]

    ## setAuthorBirthYear: get author activity information (if there are any) from CSV entry
    def setActive(self, authorData):
        regExActive = r'(active|active approximately) (([0-9][0-9][0-9][0-9].| [0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9].)|[1][0-9]th century.)'
        activeDate = re.search(regExActive, authorData)
        if (activeDate == None):
            return "Unknown"
        else:
            if (activeDate.group(0).find("approximately") != -1):
                return re.split('[.]',activeDate.group(0).split(' ')[2])[0]
            elif (activeDate.group(0).find("century") != -1):
                return re.split('[.]',activeDate.group(0).split(' ')[1])[0] + " century" 
            else:
                return re.split('[.]',activeDate.group(0).split(' ')[1])[0]

    ## setDetails: get author details (such as attributed to, copy of, etc.) from CSV entry (array value)
    def setDetails(self, authorData):
        regExDet = r'(attributed to|copy of|school of|contributor)'
        details = re.findall(regExDet, authorData)
        if (details == None):
            return "Unknown"
        else:
            return details

## AUTHOR CLASS ##
# This class holds the authors' information generated after the application of the regular expressions.
class Author:
    def __init__(self, name, birthYear, deathYear, activeDate, details):
        self.name = name
        self.birthYear = birthYear
        self.deathYear = deathYear
        self.activeDate = activeDate
        self.details = details
 
## RECORD CLASS ##
# This class holds all the paintings.
class Record:
    def __init__(self, paintings):
        self.paintings = paintings

## TESTING FUNCTIONS ##
# read from file and storing in data structures
#### TODO: SAVE NEW CSV FILE WITH AUTHOR DATA ONLY
def readfile(file):
    records = Record(paintings=[])
    authors = []
    with open (file, newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        line_count = 0
        for row in reader:
            if line_count == 0:
                line_count += 1
            else:
                a = Author('','','', '', '')
                p = Painting(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9])
                a.name = p.setAuthorName(row[1])
                a.birthYear = p.setAuthorBirthYear(row[1])
                a.deathYear = p.setAuthorDeathYear(row[1])
                a.activeDate = p.setActive(row[1])
                a.details = p.setDetails(row[1])
                records.paintings.append(p)
                authors.append(a)
                line_count += 1

    ## print all data from Paintings class
        for i in range (len(records.paintings)):
            print("AuthorData>>>>> ",records.paintings[i].authorData)
            print("NAME>>>>> ",authors[i].name)
            print("BIRTH YEAR>>>>> ",authors[i].birthYear)
            print("DEATH YEAR>>>>> ",authors[i].deathYear)
            print("ACTIVE DATE (IF EXISTS)>>>>> ", authors[i].activeDate)
            print("DETAILS (IF EXISTS)>>>>> ", authors[i].details)
            print('')

## run inside /src folder: python csv_reader.py            
readfile("../public/American_portraits_metadata.csv")
