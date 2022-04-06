import csv
import re
import pandas as pd

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
        regExName = r'([[A-zÀ-ú ]*, [[A-zÀ-ú ]*[[A-zÀ-ú. ]* ?[([A-zÀ-ú )]*|[[A-zÀ-ú]*|[[A-zÀ-ú]*\,)'
        name = re.search(regExName, authorData)
        if (name.group(0).find("Anonymous") != -1):
            return "Anonymous"
        elif (name.group(0).find("active") != -1 or name.group(0).find("approximately") != -1):
            return re.split('[,]',name.group(0))[0]
        else:
            return name.group(0)

    ## setAuthorName: get author name from CSV entry
    def setAnonymousName(self, authorData):
        regExAnon = r'(Anonymous, ([a-zA-Z ]*,? [a-zA-Z ]*,? )|Anonymous, [a-zA-Z ]*)'
        anonName = re.search(regExAnon, authorData)
        return anonName.group(0)

    ## setAuthorBirthYear: get author birth year from CSV entry
    def setAuthorBirthYear(self, authorData):
        regExBirthYear = r'([0-9][0-9][0-9][0-9]-|[0-9][0-9][0-9][0-9]\?-)'
        birthYear = re.search(regExBirthYear, authorData)
        if (birthYear == None):
            return "Unknown"
        else:
            return re.split('[?]',birthYear.group(0).split('-')[0])[0]

    ## setAuthorDeathYear: get author death year from CSV entry
    def setAuthorDeathYear(self, authorData):
        regExDeathYear = r'(-[0-9][0-9][0-9][0-9](.|,)|-[0-9][0-9][0-9][0-9]\?(.|,))'
        deathYear = re.search(regExDeathYear, authorData)
        if (deathYear == None):
            return "Unknown"
        else:
            return re.split('[?]',re.split('[, .]',deathYear.group(0).split('-')[1])[0])[0]

    ## setAuthorBirthYear: get author activity information (if there are any) from CSV entry
    def setActive(self, authorData):
        regExActive = r'(active|active approximately) (([0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9].|[0-9][0-9][0-9][0-9].|[0-9][0-9][0-9][0-9]\,)|[1][0-9]th century.)'
        activeDate = re.search(regExActive, authorData)
        if (activeDate == None):
            return "Unknown"
        else:
            if (activeDate.group(0).find("approximately") != -1):
                if (activeDate.group(0).find(",")):
                    return re.split('[,]',activeDate.group(0).split(' ')[2])[0]
                else:
                    return re.split('[.]',activeDate.group(0).split(' ')[2])[0]
            elif (activeDate.group(0).find("century") != -1):
                return re.split('[.]',activeDate.group(0).split(' ')[1])[0] + " century" 
            else:
                if (activeDate.group(0).find(",")):
                    return re.split('[,]',activeDate.group(0).split(' ')[1])[0]
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
    def __init__(self, recordNumber, name, birthYear, deathYear, title, activeDate, details, technique, medium):
        self.recordNumber = recordNumber
        self.name = name
        self.birthYear = birthYear
        self.deathYear = deathYear
        self.title = title
        self.activeDate = activeDate
        self.details = details
        self.technique = technique
        self.medium = medium

## TESTING FUNCTIONS ##
# transforming array a into string separated by commas
def arrayToString(a):
    return ', '.join(a)

# write object read from csv to new csv
def writeFile(paintings,authors):
    with open('exit.csv', mode='w', newline='', encoding='utf-8') as file:
        fieldnames = ['record_number','name','birth_year','death_year','active_date','details','title','technique','medium',]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()

        for i in range (len(paintings)):
            writer.writerow({'record_number': authors[i].recordNumber, 'name':authors[i].name, 'birth_year':authors[i].birthYear, 
            'death_year':authors[i].deathYear, 'active_date':authors[i].activeDate,
            'details':('None' if len(authors[i].details) == 0 else arrayToString(authors[i].details) ),
            'title': authors[i].title,
            'technique': authors[i].technique,
            'medium': authors[i].medium})
    
# read from file and storing in data structures
# save file in csv
def readAndSave(file):
    paintings = []
    authors = []
    
    with open (file, newline='', encoding='utf-8'):
        lines = groupedCsv(file).splitlines()
        reader = csv.reader(lines)
        line_count = 0
        for row in reader:
            if line_count == 0:
                line_count += 1
            else:
                a = Author('','','','','','','','','')
                p = Painting(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9])
                a.recordNumber = row[0]
                if(p.setAuthorName(row[1]) == "Anonymous"):
                    if(p.setAuthorBirthYear(row[1]) != 'Unknown' and p.setAuthorDeathYear(row[1]) != 'Unknown'):
                        a.name = p.setAnonymousName(row[1]) + p.setAuthorBirthYear(row[1]) + '-' + p.setAuthorDeathYear(row[1])
                    elif(p.setAuthorBirthYear(row[1]) == 'Unknown' and p.setAuthorDeathYear(row[1]) != 'Unknown'):
                        a.name = p.setAnonymousName(row[1]) + '-' + p.setAuthorDeathYear(row[1])
                    elif(p.setAuthorBirthYear(row[1]) != 'Unknown' and p.setAuthorDeathYear(row[1]) == 'Unknown'):
                        a.name = p.setAnonymousName(row[1]) + p.setAuthorDeathYear(row[1]) + '-'
                    elif(p.setActive(row[1]) != 'Unknown'):
                        a.name = p.setAnonymousName(row[1]) + p.setActive(row[1])

                else:
                    a.name = p.setAuthorName(row[1])
                
                # prev_name = a.name

                # if line_count == 1:
                #     # setar variáveis
                #     current_name = a.name
                #     next_name = a.name
                #     index = 1

                # if line_count > 1 and prev_name != next_name:
                #     # próximo se torna atual
                #     aux = prev_name
                #     prev_name = next_name
                #     next_name = aux

                #     # atual se torna anterior
                #     aux = current_name
                #     current_name = prev_name
                #     prev_name = aux

                #     index += 1

                # print('PROX ' + next_name)
                # print('ATUAL ' + current_name )
                # print('ANTERIOR ' + prev_name+ '\n')

                # # a.index = index
                a.birthYear = p.setAuthorBirthYear(row[1])
                a.deathYear = p.setAuthorDeathYear(row[1])
                a.activeDate = p.setActive(row[1])
                a.details = p.setDetails(row[1])
                a.title = row[2]
                a.technique = row[3]
                a.medium = row[5]
                
                if(a.activeDate != 'Unknown' or a.birthYear != 'Unknown' or a.deathYear != 'Unknown'):
                    paintings.append(p)
                    authors.append(a)
                    line_count += 1

                print('Added ' + a.name)

        ## write to csv
        writeFile(paintings,authors)

## function to order authors by name to make pagination work properly
def groupedCsv(file):
    df = pd.read_csv(file)
    df.sort_values(["AUTHOR"], 
                    axis=0,
                    inplace=True,
                    kind='mergesort',
                    na_position='last',)

    return df.to_csv(index=False)

## run inside /src folder: python main.py            
readAndSave("../public/American_portraits_metadata.csv")