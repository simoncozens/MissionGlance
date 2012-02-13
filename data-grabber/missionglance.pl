use MissionGlance::DataSources::JEMA;
use utf8;
use Data::Dumper;
use MissionGlance::DataSources::Wikipedia;
use MissionGlance::DataSources::CIS;
use JSON::XS;

use strict;
my (%regions, %japan);
my %prefectures = %{ MissionGlance::DataSources::JEMA::get() };
my %cis   = %{ MissionGlance::DataSources::CIS::get() };

for (keys %prefectures) {
    my $prefdata = MissionGlance::DataSources::Wikipedia::get_pref($_);
    $prefectures{$_} = { %{$prefectures{$_}}, wikipedia => $prefdata };
    my $japanese_name = $prefdata->{JapaneseName};
    if ($_ eq "Tokyo") { $japanese_name = "東京都" };
    $japanese_name =~ s/\s+$//;
    die "Couldn't find $_ ($japanese_name) in CIS data" unless $cis{$japanese_name};
    $prefectures{$_} = {%{$prefectures{$_}}, %{$cis{$japanese_name}}};
    # Regions
    $prefdata->{Region} =~ s/.*\|(.*?)\]\]/$1/;
    $prefdata->{Region} =~ s/\[\[|\]\]//g;
    $prefdata->{Region} =~ s/\x{16b}/u/g;
    $prefdata->{Region} =~ s/\x{14d}/o/g;
    $prefdata->{Region} = "Kanto" if /Tokyo/;
    $prefdata->{Population} =~ s/,//g; $prefdata->{TotalArea} =~ s/,//g;
    push @{$regions{$prefdata->{Region}}{prefectures}}, $_;
    $regions{$prefdata->{Region}}{wikipedia}{Population} += $prefdata->{Population};
    $regions{$prefdata->{Region}}{wikipedia}{TotalArea} += $prefdata->{TotalArea};
    $japan{wikipedia}{Population} += $prefdata->{Population};
    $japan{wikipedia}{TotalArea} += $prefdata->{TotalArea};
    for my $k (qw/missionaries members attendance churches sunday_school baptisms/) {
        $regions{$prefdata->{Region}}{$k} += $prefectures{$_}{$k};
        $japan{$k} += $prefectures{$_}{$k};
    }
}
print encode_json({ japan => \%japan, regions => \%regions, prefectures => \%prefectures });
