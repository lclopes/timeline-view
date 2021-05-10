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
    
    ## TODO: CHECK REGEX
    def setAuthorName(self, authorData):
        regExName = r'[a-zA-Z ]*, [a-zA-Z ]*[a-zA-Z. ]* ?[(a-zA-Z )]*'
        name = re.search(regExName, authorData)
        return name.group(0)

    def setAuthorBirthYear(self, authorData):
        regExBirthYear = r'[0-9][0-9][0-9][0-9]-'
        birthYear = re.search(regExBirthYear, authorData)
        if (birthYear == None):
            return "Unknown"
        else:
            return birthYear.group(0).split('-')[0]

    def setAuthorDeathYear(self, authorData):
        regExDeathYear = r'-[0-9][0-9][0-9][0-9](.|,)'
        deathYear = re.search(regExDeathYear, authorData)
        if (deathYear == None):
            return "Unknown"
        else:
            return re.split('[, .]',deathYear.group(0).split('-')[1])[0]

    def setActive(self, authorData):
        regExActive = r'(active|active approximately)( [0-9][0-9][0-9][0-9].| [0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9].)'
        activeDate = re.search(regExActive, authorData)
        if (activeDate == None):
            return "Unknown"
        else:
            return re.split('[.]',activeDate.group(0).split(' ')[1])[0]

class Author:
    def __init__(self, name, birthYear, deathYear, activeDate):
        self.name = name
        self.birthYear = birthYear
        self.deathYear = deathYear
        self.activeDate = activeDate

## RECORD CLASS ##
# This class holds all the paintings.
class Record:
    def __init__(self, paintings):
        self.paintings = paintings

## TESTING FUNCTIONS ##
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
                a = Author('','','', '')
                p = Painting(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9])
                a.name = p.setAuthorName(row[1])
                a.birthYear = p.setAuthorBirthYear(row[1])
                a.deathYear = p.setAuthorDeathYear(row[1])
                a.activeDate = p.setActive(row[1])
                records.paintings.append(p)
                authors.append(a)
                line_count += 1

        for i in range (len(records.paintings)):
            print("AuthorData>>>>> ",records.paintings[i].authorData)   
            print("NAME>>>>> ",authors[i].name)
            print("BIRTH YEAR>>>>> ",authors[i].birthYear)
            print("DEATH YEAR>>>>> ",authors[i].deathYear)
            print("ACTIVE DATE>>>>> ", authors[i].activeDate)
            print('')
readfile("../public/portraits_test.csv")
